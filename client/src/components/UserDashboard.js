import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import LogoutButton from './LogoutButton';
import unblockIcon from '../images/unblock.png'
import deleteIcon from '../images/delete.png'

function UserDashboard() {
  const [userName, setUserName] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/users', {headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }}); 
        //http://localhost:5000
        setUsers(response.data);

        //const response1 = await axios.get('http://localhost:5000/api/users/me', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }});
        //setUserName(response1.data.name);

      } catch (err) {
        navigate('/login');
      }
    };

    fetchUsers();
  }, [navigate]);

  useEffect(() => {
    const fetchUserName = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const response = await axios.get('http://localhost:5000/api/users/me', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }});
        setUserName(response.data.name); 
      } catch (err) {
        console.error('Error fetching user data:', err);
        localStorage.removeItem('token');
        navigate('/login');
      }
    };

    fetchUserName();
  }, [navigate]);

  const handleSelectUser = (id) => {
    setSelectedUsers((prevSelectedUsers) =>
      prevSelectedUsers.includes(id)
        ? prevSelectedUsers.filter((userId) => userId !== id)
        : [...prevSelectedUsers, id]
    );
  };

  const handleSelectAllUsers = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map((user) => user.id));
    }
  };

  const handleAction = async (action) => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.post(`http://localhost:5000/api/users/${action}`, { userIds: selectedUsers }, 
                                                                                     { headers: { Authorization: `Bearer ${token}` }});
      if(response.data.selfBlocked){
        //alert("you blocked yourself");
        localStorage.removeItem('token');
        navigate('/login');
      }
      else{
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            selectedUsers.includes(user.id)
              ? { ...user, status: action === 'block' ? 'blocked' : 'active' }
              : user
          )
        );
      }
      
      setSelectedUsers([]);
    } catch (err) {
      alert('Action failed');
    }
  };

  const handleDelete = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.post('http://localhost:5000/api/users/delete', { userIds: selectedUsers }, 
                                                                                  { headers: { Authorization: `Bearer ${token}` }});
      if (response.data.selfDeleted) {
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        
        setUsers((prevUsers) =>
          prevUsers.filter((user) => !selectedUsers.includes(user.id))
        );
      }
      setSelectedUsers([]);
    } catch (err) {
      alert('Delete failed');
    }
  };

//<span className="me-3">Hello, {userName}</span>

  return (
    <div className="container mt-5">
      
      <div className="d-flex justify-content-between align-items-center">
        <h2>User Dashboard</h2>
        <div className="d-flex align-items-center">
          <span className="me-3">Hello, {userName}</span>
          <LogoutButton />
        </div>
      </div>

      <div className="mb-3">
        <button className="btn btn-danger me-2" onClick={() => handleAction('block')}>Block</button>
        <button className="btn btn-secondary me-2" onClick={() => handleAction('unblock')}>
          <img src={unblockIcon} alt="Unblock" style={{ width: '24px', height: '24px' }} />
        </button>
        <button className="btn btn-danger" onClick={handleDelete}>
          <img src={deleteIcon} alt="Delete" style={{ width: '24px', height: '24px' }} />
        </button>
      </div>
      <table className="table table-striped">
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                onChange={handleSelectAllUsers}
                checked={selectedUsers.length === users.length}
              />
            </th>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Last Login</th>
            <th>Registration</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>
                <input
                  type="checkbox"
                  checked={selectedUsers.includes(user.id)}
                  onChange={() => handleSelectUser(user.id)}
                />
              </td>
              <td>{user.id}</td>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.updated_at ? new Date(user.updated_at).toLocaleString() : 'N/A'}</td>
              <td>{user.created_at ? new Date(user.created_at).toLocaleString() : 'N/A'}</td>
              <td>{user.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default UserDashboard;