import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { User, Mail, Phone, Save, Loader2 } from 'lucide-react';
import config from "../config";
const USER_API = config.USER_API; 
const CustomerProfile = () => {
    const [profile, setProfile] = useState({
        username: '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        role: ''
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    const getUserIdFromToken = () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return null;

            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.id || payload.userId || payload._id || payload.user?.id || null;
        } catch (error) {
            console.error('Token decode error:', error);
            return null;
        }
    };

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const userId = getUserIdFromToken();

            if (!userId) {
                setMessage('User not found in token');
                setLoading(false);
                return;
            }

            const res = await axios.get(`${USER_API}/${userId}`);
            const user = res.data;

            setProfile({
                username: user.username || '',
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                email: user.email || '',
                phone: user.phone || '',
                role: user.role || ''
            });
        } catch (error) {
            console.error('Fetch profile error:', error);
            setMessage('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleChange = (e) => {
        setProfile({
            ...profile,
            [e.target.name]: e.target.value
        });
    };

    const handleUpdate = async (e) => {
        e.preventDefault();

        try {
            setSaving(true);
            setMessage('');

            const userId = getUserIdFromToken();

            await axios.put(`${USER_API}/${userId}`, {
                userName: profile.username,
                firstName: profile.firstName,
                lastName: profile.lastName,
                phone: profile.phone
            });

            setMessage('Profile updated successfully');
        } catch (error) {
            console.error('Update profile error:', error);
            setMessage('Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex justify-center items-center min-h-[300px]">
                <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold mb-2 text-gray-800">Manage Profile</h2>
            <p className="text-gray-500 mb-8">Update your customer profile details here.</p>

            {message && (
                <div className="mb-6 p-4 rounded-xl bg-orange-50 text-orange-700 border border-orange-200">
                    {message}
                </div>
            )}

            <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                    <div className="relative">
                        <User className="w-5 h-5 absolute left-3 top-3.5 text-gray-400" />
                        <input
                            type="text"
                            name="username"
                            value={profile.username}
                            onChange={handleChange}
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                            placeholder="Enter username"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                    <input
                        type="text"
                        value={profile.role}
                        disabled
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-100 text-gray-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                    <input
                        type="text"
                        name="firstName"
                        value={profile.firstName}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="Enter first name"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                    <input
                        type="text"
                        name="lastName"
                        value={profile.lastName}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="Enter last name"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <div className="relative">
                        <Mail className="w-5 h-5 absolute left-3 top-3.5 text-gray-400" />
                        <input
                            type="email"
                            value={profile.email}
                            disabled
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-100 text-gray-500"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <div className="relative">
                        <Phone className="w-5 h-5 absolute left-3 top-3.5 text-gray-400" />
                        <input
                            type="text"
                            name="phone"
                            value={profile.phone}
                            onChange={handleChange}
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                            placeholder="Enter phone number"
                        />
                    </div>
                </div>

                <div className="md:col-span-2 flex justify-end">
                    <button
                        type="submit"
                        disabled={saving}
                        className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-colors"
                    >
                        {saving ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="w-5 h-5" />
                                Save Changes
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CustomerProfile;