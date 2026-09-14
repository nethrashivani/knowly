import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import Navbar from '../components/Navbar';

import {
  uploadResource,
  getWorkshopResources,
  deleteResource,
  downloadResource
} from '../services/workshopResourceService';

import { getWorkshopById } from '../services/workshopService';
import { getUser } from '../services/authService';

function WorkshopResourcesPage() {
  const { workshopId } = useParams();
  const navigate = useNavigate();

  const [workshop, setWorkshop] = useState(null);
  const [resources, setResources] = useState([]);

  const [title, setTitle] = useState('');
  const [file, setFile] = useState(null);

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState('');

  const currentUser = getUser();

  const isTeacher =
    workshop &&
    currentUser &&
    workshop.teacherEmail === currentUser.email;

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      const [workshopData, resourcesData] = await Promise.all([
        getWorkshopById(workshopId),
        getWorkshopResources(workshopId)
      ]);

      setWorkshop(workshopData);
      setResources(resourcesData);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
        'Failed to load workshop resources.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadWorkshopData = async () => {
      try {
        setLoading(true);
        setError('');

        const [workshopData, resourcesData] = await Promise.all([
          getWorkshopById(workshopId),
          getWorkshopResources(workshopId)
        ]);

        setWorkshop(workshopData);
        setResources(resourcesData);
      } catch (err) {
        console.error(err);

        setError(
          err.response?.data?.message ||
          'Failed to load workshop resources.'
        );
      } finally {
        setLoading(false);
      }
    };

    loadWorkshopData();
  }, [workshopId]);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) {
      setFile(null);
      return;
    }

    setFile(selectedFile);
    setError('');
  };

  const handleUpload = async (event) => {
    event.preventDefault();

    if (!title.trim()) {
      setError('Please enter a resource title.');
      return;
    }

    if (!file) {
      setError('Please select a file.');
      return;
    }

    try {
      setUploading(true);
      setError('');

      await uploadResource(
        workshopId,
        title.trim(),
        file
      );

      setTitle('');
      setFile(null);

      event.target.reset();

      await loadData();
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
        'Failed to upload resource.'
      );
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (resourceId) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this resource?'
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(resourceId);
      setError('');

      await deleteResource(resourceId);

      setResources((currentResources) =>
        currentResources.filter(
          (resource) => resource.id !== resourceId
        )
      );
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
        'Failed to delete resource.'
      );
    } finally {
      setDeletingId(null);
    }
  };

  const handleDownload = async (resource) => {
    try {
      setDownloadingId(resource.id);
      setError('');

      const response = await downloadResource(resource.id);

      const blobUrl = window.URL.createObjectURL(
        new Blob([response.data], {
          type: resource.fileType
        })
      );

      const link = document.createElement('a');

      link.href = blobUrl;
      link.download = resource.fileName;

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
        'Failed to download resource.'
      );
    } finally {
      setDownloadingId(null);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) {
      return '';
    }

    const units = ['Bytes', 'KB', 'MB', 'GB'];
    const index = Math.floor(
      Math.log(bytes) / Math.log(1024)
    );

    return `${(bytes / Math.pow(1024, index)).toFixed(
      index === 0 ? 0 : 1
    )} ${units[index]}`;
  };

  const getFileTypeLabel = (resource) => {
    const fileName = resource.fileName || '';
    const extension =
      fileName.includes('.')
        ? fileName.split('.').pop().toUpperCase()
        : 'FILE';

    if (resource.fileType?.includes('pdf')) {
      return 'PDF';
    }

    if (
      resource.fileType?.includes('presentation') ||
      ['PPT', 'PPTX'].includes(extension)
    ) {
      return 'PPT';
    }

    if (
      resource.fileType?.includes('word') ||
      ['DOC', 'DOCX'].includes(extension)
    ) {
      return 'DOC';
    }

    if (
      resource.fileType?.includes('image') ||
      ['PNG', 'JPG', 'JPEG', 'WEBP', 'GIF'].includes(extension)
    ) {
      return 'IMG';
    }

    if (
      resource.fileType?.includes('audio') ||
      ['MP3', 'WAV', 'M4A'].includes(extension)
    ) {
      return 'AUDIO';
    }

    if (
      resource.fileType?.includes('video') ||
      ['MP4', 'MOV', 'AVI', 'MKV'].includes(extension)
    ) {
      return 'VIDEO';
    }

    return extension;
  };

  if (loading) {
    return (
      <>
        <Navbar />

        <div className="min-h-screen bg-gray-50 px-4 py-10">
          <div className="max-w-5xl mx-auto">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-10 text-center">
              <p className="text-gray-500">
                Loading learning resources...
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gray-50 px-4 py-8">
        <div className="max-w-5xl mx-auto">

          {/* Back button */}
          <button
            onClick={() =>
              navigate(
                isTeacher
                  ? '/my-workshops'
                  : '/my-applications'
              )
            }
            className="text-blue-600 hover:text-blue-800 font-medium mb-6 transition"
          >
            ← Back
          </button>

          {/* Workshop header */}
          {workshop && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                <div>
                  <p className="text-sm font-medium text-blue-600 mb-1">
                    {isTeacher
                      ? 'Workshop Resources'
                      : 'Learning Materials'}
                  </p>

                  <h1 className="text-3xl font-bold text-gray-800">
                    {workshop.title}
                  </h1>

                  <p className="text-gray-500 mt-2">
                    {isTeacher
                      ? 'Manage the learning materials available to your learners.'
                      : 'Access the learning materials provided by your workshop host.'}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-xl px-5 py-4 text-sm text-gray-600">
                  <p>
                    <span className="font-semibold">
                      Resources:
                    </span>{' '}
                    {resources.length}
                  </p>

                  {workshop.teacherName && (
                    <p className="mt-1">
                      <span className="font-semibold">
                        Host:
                      </span>{' '}
                      {workshop.teacherName}
                    </p>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-6">
              {error}
            </div>
          )}

          {/* Teacher upload section */}
          {isTeacher && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">

              <div className="mb-5">
                <h2 className="text-xl font-bold text-gray-800">
                  Add Learning Resource
                </h2>

                <p className="text-gray-500 mt-1 text-sm">
                  Upload notes, presentations, recordings,
                  exercises, images, or other useful materials.
                </p>
              </div>

              <form onSubmit={handleUpload}>

                {/* Resource title */}
                <div className="mb-5">
                  <label
                    htmlFor="resource-title"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Resource Title
                  </label>

                  <input
                    id="resource-title"
                    type="text"
                    value={title}
                    onChange={(event) =>
                      setTitle(event.target.value)
                    }
                    placeholder="e.g. Java Basics Notes"
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  />
                </div>

                {/* File picker */}
                <div className="mb-5">
                  <label
                    htmlFor="resource-file"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    File
                  </label>

                  <label
                    htmlFor="resource-file"
                    className="block border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition"
                  >
                    <div className="text-3xl mb-3">
                      +
                    </div>

                    <p className="font-semibold text-gray-700">
                      Choose a file
                    </p>

                    <p className="text-sm text-gray-500 mt-1">
                      PDF, PPT, DOC, MP3, MP4, images and more
                    </p>

                    <input
                      id="resource-file"
                      type="file"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Selected file */}
                {file && (
                  <div className="flex items-center justify-between gap-4 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 mb-5">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-blue-900 truncate">
                        {file.name}
                      </p>

                      {file.size && (
                        <p className="text-xs text-blue-700 mt-1">
                          {formatFileSize(file.size)}
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => setFile(null)}
                      className="text-sm text-red-600 hover:text-red-800 font-medium"
                    >
                      Remove
                    </button>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={uploading}
                  className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition"
                >
                  {uploading
                    ? 'Uploading Resource...'
                    : 'Upload Resource'}
                </button>

              </form>
            </div>
          )}

          {/* Resources */}
          <div>

            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  {isTeacher
                    ? 'Uploaded Resources'
                    : 'Available Resources'}
                </h2>

                <p className="text-gray-500 text-sm mt-1">
                  {isTeacher
                    ? 'Materials currently available to accepted learners.'
                    : 'Materials shared by your workshop host.'}
                </p>
              </div>

              <span className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full text-sm font-semibold">
                {resources.length}{' '}
                {resources.length === 1
                  ? 'resource'
                  : 'resources'}
              </span>
            </div>

            {resources.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-10 text-center">

                <div className="w-14 h-14 mx-auto rounded-full bg-gray-100 flex items-center justify-center text-2xl mb-4">
                  +
                </div>

                <h3 className="text-lg font-bold text-gray-800">
                  No resources yet
                </h3>

                <p className="text-gray-500 mt-2 max-w-md mx-auto">
                  {isTeacher
                    ? 'You have not uploaded any learning materials for this workshop yet.'
                    : 'The host has not uploaded any learning materials for this workshop yet.'}
                </p>

              </div>
            ) : (
              <div className="space-y-4">

                {resources.map((resource) => (
                  <div
                    key={resource.id}
                    className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 hover:shadow-md transition"
                  >
                    <div className="flex flex-col md:flex-row md:items-center gap-5">

                      {/* File badge */}
                      <div className="w-14 h-14 shrink-0 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs">
                        {getFileTypeLabel(resource)}
                      </div>

                      {/* Resource information */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-gray-800">
                          {resource.title}
                        </h3>

                        <p className="text-gray-600 text-sm mt-1 truncate">
                          {resource.fileName}
                        </p>

                        <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
                          <span>
                            {getFileTypeLabel(resource)}
                          </span>

                          {resource.uploadedAt && (
                            <span>
                              Uploaded{' '}
                              {new Date(
                                resource.uploadedAt
                              ).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 shrink-0">

                        <button
                          onClick={() =>
                            handleDownload(resource)
                          }
                          disabled={
                            downloadingId === resource.id
                          }
                          className="px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition"
                        >
                          {downloadingId === resource.id
                            ? 'Downloading...'
                            : 'Download'}
                        </button>

                        {isTeacher && (
                          <button
                            onClick={() =>
                              handleDelete(resource.id)
                            }
                            disabled={
                              deletingId === resource.id
                            }
                            className="px-4 py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-xl text-sm font-semibold hover:bg-red-100 disabled:opacity-60 disabled:cursor-not-allowed transition"
                          >
                            {deletingId === resource.id
                              ? 'Deleting...'
                              : 'Delete'}
                          </button>
                        )}

                      </div>

                    </div>
                  </div>
                ))}

              </div>
            )}

          </div>

        </div>
      </div>
    </>
  );
}

export default WorkshopResourcesPage;