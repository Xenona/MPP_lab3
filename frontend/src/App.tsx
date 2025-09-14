import React, {type JSX} from 'react';
import {BrowserRouter as Router, Routes, Route, Navigate, useNavigate} from 'react-router-dom';
import TaskList from './components/TaskList';
import EditTask from './components/EditTask';
import Login from './components/Login';
import Register from './components/Register';
import { AuthProvider, useAuth } from './context/AuthContext';

const PrivateRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <div>Loading...</div>;
    return user ? children : <Navigate to="/login" replace />;
};

const HeaderBar: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login', { replace: true });
    };

    return (
        <div className="header">
            <h1 style={{ margin: 0 }}>Task Manager</h1>
            <div className="header-right">
                {user ? (
                    <>
                        <div className="header-username">Hello, {user.username}</div>
                        <button className="secondary" onClick={handleLogout}>Logout</button>
                    </>
                ) : null}
            </div>
        </div>
    );
};

const App: React.FC = () => (
    <AuthProvider>
        <div className="container">
            <Router>
                <HeaderBar />
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/" element={
                        <PrivateRoute>
                            <TaskList />
                        </PrivateRoute>} />
                    <Route path="/tasks/:id/edit" element={
                        <PrivateRoute>
                            <EditTask />
                        </PrivateRoute>} />
                </Routes>
            </Router>
        </div>
    </AuthProvider>
);

export default App;
