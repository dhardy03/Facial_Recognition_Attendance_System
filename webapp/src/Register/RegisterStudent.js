import React, { useState } from 'react';

function RegisterStudent() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [image, setImage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!image) {
      alert('Please select an image.');
      return;
    }

    const formData = new FormData();
    formData.append('first_name', firstName);
    formData.append('last_name', lastName);
    formData.append('image', image);

    try {
      const response = await fetch('http://localhost:5000/register_student', {
        method: 'POST',
        body: formData, // No need for JSON headers, FormData handles it
      });

      const result = await response.json();
      if (response.ok) {
        alert(result.message);  // Show success message
      } else {
        alert('Error: ' + result.error);  // Show error message
      }
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  return (
    <div>
      <h2>Register New Student</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>First Name</label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Last Name</label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Upload Face Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
            required
          />
        </div>
        <button type="submit">Register Student</button>
      </form>
    </div>
  );
}

export default RegisterStudent;
