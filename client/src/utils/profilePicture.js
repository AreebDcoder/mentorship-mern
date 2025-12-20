// Utility function for profile pictures

// Default profile picture (SVG as base64)
export const getDefaultProfilePicture = (name = 'User') => {
    const initial = name.charAt(0).toUpperCase();
    const colors = [
        '#DC143C', '#B71C1C', '#FFB800', '#FF8C00', 
        '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b',
        '#10b981', '#3b82f6', '#ef4444', '#14b8a6'
    ];
    const colorIndex = name.charCodeAt(0) % colors.length;
    const bgColor = colors[colorIndex];
    
    // Create SVG with initial
    const svg = `
        <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
            <rect width="100" height="100" fill="${bgColor}"/>
            <text x="50" y="50" font-family="Arial, sans-serif" font-size="40" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="central">${initial}</text>
        </svg>
    `.trim();
    
    return `data:image/svg+xml;base64,${btoa(svg)}`;
};

// Get profile picture URL or default
export const getProfilePicture = (user) => {
    if (user?.profile?.profilePicture) {
        return user.profile.profilePicture;
    }
    return getDefaultProfilePicture(user?.name || 'User');
};

