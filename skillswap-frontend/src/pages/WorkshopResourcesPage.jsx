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
  const [error, setError] = useState('');

  const currentUser = getUser();

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
    }
  };

  const handleDownload = async (resource) => {
    try {
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
    }
  };

  const isTeacher =
    workshop &&
    currentUser &&
    workshop.teacherEmail === currentUser.email;
  if (loading) {
    return (
      <>
        <Navbar />
        <div className="page-container">
          <p>Loading resources...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div className="page-container">

        <button
          className="back-button"
          onClick={() => navigate('/my-workshops')}
        >
          ← Back to My Workshops
        </button>

        {workshop && (
          <div className="page-header">
            <h1>Learning Resources</h1>
            <p>
              Resources for <strong>{workshop.title}</strong>
            </p>
          </div>
        )}

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {isTeacher && (
          <div className="form-card">
            <h2>Add Learning Resource</h2>

            <p>
              Upload notes, presentations, recordings,
              audio files, or other useful material for
              your learners.
            </p>

            <form onSubmit={handleUpload}>

              <div className="form-group">
                <label htmlFor="resource-title">
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
                />
              </div>

              <div className="form-group">
                <label htmlFor="resource-file">
                  File
                </label>

                <input
                  id="resource-file"
                  type="file"
                  onChange={handleFileChange}
                />
              </div>

              {file && (
                <p>
                  Selected file:{' '}
                  <strong>{file.name}</strong>
                </p>
              )}

              <button
                type="submit"
                className="primary-button"
                disabled={uploading}
              >
                {uploading
                  ? 'Uploading...'
                  : 'Upload Resource'}
              </button>

            </form>
          </div>
        )}

        <div className="resources-section">
          <div className="section-header">
            <h2>Workshop Resources</h2>
            <span>
              {resources.length}{' '}
              {resources.length === 1
                ? 'resource'
                : 'resources'}
            </span>
          </div>

          {resources.length === 0 ? (
            <div className="empty-state">
              <h3>No resources yet</h3>

              <p>
                {isTeacher
                  ? 'Upload notes, recordings, presentations, or other material for your learners.'
                  : 'The host has not uploaded any learning resources yet.'}
              </p>
            </div>
          ) : (
            <div className="resources-list">

              {resources.map((resource) => (
                <div
                  className="resource-card"
                  key={resource.id}
                >

                  <div className="resource-info">

                    <h3>{resource.title}</h3>

                    <p>
                      {resource.fileName}
                    </p>

                    <small>
                      {resource.fileType}
                    </small>

                  </div>

                  <div className="resource-actions">

                    <button
                      className="secondary-button"
                      onClick={() =>
                        handleDownload(resource)
                      }
                    >
                      Download
                    </button>

                    {isTeacher && (
                      <button
                        className="danger-button"
                        onClick={() =>
                          handleDelete(resource.id)
                        }
                      >
                        Delete
                      </button>
                    )}

                  </div>

                </div>
              ))}

            </div>
          )}
        </div>

      </div>
    </>
  );
}

export default WorkshopResourcesPage;