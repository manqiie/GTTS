import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const EmailReject = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [timesheetInfo, setTimesheetInfo] = useState(null);
    const [comments, setComments] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        validateToken();
    }, [token]);

    const validateToken = async () => {
        try {
            const response = await axios.get(
                `${process.env.REACT_APP_API_URL}/email-actions/reject/${token}`
            );
            
            if (response.data.success) {
                setTimesheetInfo(response.data);
            } else {
                setError(response.data.message);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid or expired link');
        } finally {
            setLoading(false);
        }
    };

    const handleReject = async (e) => {
        e.preventDefault();
        
        if (!comments.trim()) {
            setError('Please provide comments for rejection');
            return;
        }

        setSubmitting(true);
        setError('');

        try {
            const response = await axios.post(
                `${process.env.REACT_APP_API_URL}/email-actions/reject/${token}`,
                { comments: comments.trim() }
            );

            if (response.data.success) {
                navigate('/approval/success', { 
                    state: { message: 'Timesheet rejected successfully' }
                });
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reject timesheet');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Validating link...</p>
                </div>
            </div>
        );
    }

    if (error && !timesheetInfo) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8">
                    <div className="text-center">
                        <div className="text-red-500 text-6xl mb-4">⚠</div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Invalid Link</h2>
                        <p className="text-gray-600 mb-6">{error}</p>
                        <button
                            onClick={() => navigate('/approval')}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                        >
                            Go to Approval Page
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
                <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                    {/* Header */}
                    <div className="bg-red-600 px-6 py-4">
                        <h1 className="text-2xl font-bold text-white">
                            Reject Timesheet
                        </h1>
                    </div>

                    {/* Timesheet Info */}
                    <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900 mb-3">
                            Timesheet Details
                        </h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <span className="text-sm text-gray-600">Employee:</span>
                                <p className="font-medium text-gray-900">
                                    {timesheetInfo?.employeeName}
                                </p>
                            </div>
                            <div>
                                <span className="text-sm text-gray-600">Employee ID:</span>
                                <p className="font-medium text-gray-900">
                                    {timesheetInfo?.employeeId}
                                </p>
                            </div>
                            <div>
                                <span className="text-sm text-gray-600">Period:</span>
                                <p className="font-medium text-gray-900">
                                    {timesheetInfo?.month} {timesheetInfo?.year}
                                </p>
                            </div>
                            <div>
                                <span className="text-sm text-gray-600">Version:</span>
                                <p className="font-medium text-gray-900">
                                    {timesheetInfo?.version}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Rejection Form */}
                    <form onSubmit={handleReject} className="px-6 py-6">
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Rejection Comments <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={comments}
                                onChange={(e) => setComments(e.target.value)}
                                rows={6}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                placeholder="Please provide specific feedback on what needs to be corrected..."
                                required
                            />
                            <p className="mt-2 text-sm text-gray-500">
                                Provide clear feedback to help the employee correct their timesheet.
                            </p>
                        </div>

                        {error && (
                            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                                {error}
                            </div>
                        )}

                        <div className="flex gap-4">
                            <button
                                type="submit"
                                disabled={submitting || !comments.trim()}
                                className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                            >
                                {submitting ? 'Rejecting...' : 'Reject Timesheet'}
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate('/approval')}
                                className="px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>

                {/* Instructions */}
                <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h3 className="font-semibold text-yellow-900 mb-2">
                        ⚠ Important Information
                    </h3>
                    <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
                        <li>The employee will receive your feedback via email</li>
                        <li>They will be able to make corrections and resubmit</li>
                        <li>Be specific about what needs to be changed</li>
                        <li>This action cannot be undone</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default EmailReject;