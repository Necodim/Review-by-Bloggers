import React from 'react';
import './Profile.css';
import { useUserProfile } from '../../hooks/UserProfileContext.js';
import Preloader from '../Preloader/Preloader';
import ProfileBlogger from './Blogger/ProfileBlogger.jsx';
import ProfileSeller from './Seller/ProfileSeller.jsx';


const Profile = (props) => {
    const { role, loading } = useUserProfile();

    if (loading) {
        return <Preloader>Загружаюсь...</Preloader>;
    } else if (role === 'blogger') {
        return (<ProfileBlogger />)
    } else if (role === 'seller') {
        return <ProfileSeller />
    }
}

export default Profile