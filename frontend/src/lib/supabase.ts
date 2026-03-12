import { createClient } from '@supabase/supabase-js';
import { API_URL } from './api';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Upload a file to storage
export async function uploadFile(file: File, bucket: string = 'documents', folder: string = '') {
  const fileName = folder ? `${folder}/${Date.now()}_${file.name}` : `${Date.now()}_${file.name}`;

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(fileName, file);

  if (error) {
    console.error('Upload error:', error);
    return { data: null, error };
  }

  // Get the public URL
  const { data: urlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path);

  return {
    data: {
      fileName: data.path,
      publicUrl: urlData.publicUrl,
      uploadedAt: new Date(),
    },
    error: null,
  };
}

// List all files in a bucket/folder
export async function listFiles(bucket: string = 'test-building-files', folder: string = '') {
  const { data, error } = await supabase.storage
    .from(bucket)
    .list(folder, { limit: 100, offset: 0 });

  if (error) {
    console.error('List error:', error);
    return [];
  }

  // Hide system folders (trash/recently-deleted) from any UI listings
  return data.filter(item =>
    item.name !== 'recently-deleted' &&
    item.name !== 'trash' &&
    !item.name.startsWith('.')
  );
}

// Delete a file (permanently)
// Delete a file (permanently) - using backend proxy to bypass RLS
export async function deleteFile(fileName: string, bucket: string = 'test-building-files') {
  try {
    const response = await fetch(`${API_URL}/_api/storage/file?path=${encodeURIComponent(fileName)}&bucket=${bucket}`, {
      method: 'DELETE'
    });
    if (!response.ok) {
      console.error('Delete error via proxy:', await response.text());
      return false;
    }
    return true;
  } catch (error) {
    console.error('Delete error via proxy:', error);
    return false;
  }
}

// Move a file (e.g. to trash)
export async function moveFile(fromPath: string, toPath: string, bucket: string = 'test-building-files') {
  const { data, error } = await supabase.storage
    .from(bucket)
    .move(fromPath, toPath);

  if (error) {
    console.error('Move error:', error);
    return false;
  }
  return true;
}

// Download a file
export async function downloadFile(fileName: string, bucket: string = 'documents') {
  const { data, error } = await supabase.storage
    .from(bucket)
    .download(fileName);

  if (error) {
    console.error('Download error:', error);
    return null;
  }

  return data;
}

// ===== BUILDINGS TABLE OPERATIONS =====

// Get all buildings
export async function getBuildings() {
  const { data, error } = await supabase
    .from('Building')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching buildings:', error);
    return [];
  }

  return data;
}

// Create a building
export async function createBuilding(building: { name: string; address: string; floors: string; sqft: string }) {
  const { data, error } = await supabase
    .from('Building')
    .insert([building])
    .select()
    .single();

  if (error) {
    console.error('Error creating building:', error);
    return null;
  }

  return data;
}

// Delete a building
export async function deleteBuilding(id: string) {
  const { error } = await supabase
    .from('Building')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting building:', error);
    return false;
  }

  return true;
}

// Update a building
export async function updateBuilding(id: string, updates: Partial<{ name: string; address: string; floors: string; sqft: string }>) {
  const { data, error } = await supabase
    .from('Building')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating building:', error);
    return null;
  }

  return data;
}

// ===== FILES TABLE OPERATIONS =====

export async function createFileRecord(fileData: {
  companyId: string;
  buildingId: string;
  folder: string;
  filename: string;
  fileType: string;
  s3Key: string;
}) {
  /* 
   * Retry logic for FolderType enum constraints.
   * Supabase/Postgres enums are strict. If the provided folder name doesn't match,
   * we try standard fallbacks to ensure the file record is still created.
   */
  let attemptError = null;
  const folderTitle = fileData.folder.charAt(0).toUpperCase() + fileData.folder.slice(1).toLowerCase();
  const fallbacks = [
    fileData.folder.toUpperCase(),
    folderTitle,
    fileData.folder,
    fileData.folder.toLowerCase(),
    'OTHER',
    'Other',
    'other'
  ];
  const uniqueFallbacks = [...new Set(fallbacks)];

  for (const folderValue of uniqueFallbacks) {
    const payload = {
      id: crypto.randomUUID(), // Ensure ID is provided since DB constraint failed earlier
      ...fileData,
      folder: folderValue
    };

    const { data, error } = await supabase
      .from('File')
      .insert([payload])
      .select()
      .single();

    if (!error) {
      return { data, error: null };
    }

    // specific check for enum violation or similar data errors
    if (error.code === '22P02' || error.message?.includes('enum')) {
      attemptError = error;
      continue; // Try next fallback
    } else {
      // Other error (auth, connection, etc) - fail info immediately
      console.error('Error creating file record:', error);
      return { data: null, error };
    }
  }

  // If all fallbacks failed
  console.error('All folder type attempts failed. Last error:', attemptError);
  return { data: null, error: attemptError };
}

// Delete file record from DB
// Delete file record from DB - using backend proxy to bypass RLS
export async function deleteFileRecord(s3Key: string, filename?: string) {
  try {
    let url = `${API_URL}/_api/storage/record?s3Key=${encodeURIComponent(s3Key)}`;
    if (filename) url += `&filename=${encodeURIComponent(filename)}`;

    const response = await fetch(url, {
      method: 'DELETE'
    });

    if (!response.ok) {
      console.error('Delete record error via proxy:', await response.text());
      return false;
    }
    return true;
  } catch (error) {
    console.error('Delete record error via proxy:', error);
    return false;
  }
}

// Get files for AI embedding (scoped to company)
export async function getFilesForEmbedding(companyId?: string) {
  let query = supabase
    .from('File')
    .select('*')
    .order('created_at', { ascending: false });

  if (companyId) {
    query = query.eq('companyId', companyId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching files for embedding:', error);
    return [];
  }
  return data;
}

// Get file counts by building and folder (scoped to company)
export async function getFileCounts(companyId?: string, buildingIds?: string[]) {
  let query = supabase
    .from('File')
    .select('buildingId, folder');

  // Filter by company if provided
  if (companyId) {
    query = query.eq('companyId', companyId);
  }

  // Filter by specific building IDs if provided
  if (buildingIds && buildingIds.length > 0) {
    query = query.in('buildingId', buildingIds);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching file counts:', error);
    return [];
  }

  // Aggregate counts
  // Structure: { buildingId: { total: 0, categories: { folder: count } } }
  const counts: Record<string, any> = {};

  data.forEach((file: any) => {
    const buildingId = file.buildingId || 'unknown';
    const folder = (file.folder || 'other').toLowerCase();

    if (!counts[buildingId]) {
      counts[buildingId] = { total: 0, categories: {} };
    }

    counts[buildingId].total++;
    counts[buildingId].categories[folder] = (counts[buildingId].categories[folder] || 0) + 1;
  });

  return counts;
}