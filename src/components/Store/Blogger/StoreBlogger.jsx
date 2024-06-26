import React, { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom';
import '../Store.css'
import { useToastManager } from '../../../hooks/useToast';
import { useUserProfile } from '../../../hooks/UserProfileContext';
import Header from '../../Header/Header';
import Popup from '../../Popup/Popup';
import Categories from './Categories';
import EmptySpace from '../../EmptySpace/EmptySpace';

const StoreBlogger = (props) => {
	const { profile } = useUserProfile();
	const navigate = useNavigate();
	const location = useLocation();
	const { showToast } = useToastManager();

	const [errorMessage, setErrorMessage] = useState('');
	const [showPopupAfterBloggerOnboarding, setShowPopupAfterBloggerOnboarding] = useState(false);

	useEffect(() => {
		if (location.state?.showPopupAfterBloggerOnboarding) {
			console.log("Показываем попап");
			console.log(location);
			setShowPopupAfterBloggerOnboarding(true);
		}
	}, [location.state]);

	useEffect(() => {
		if (errorMessage) {
			showToast(errorMessage, 'error');
			setErrorMessage('');
		}
	}, [errorMessage, showToast]);

	const handleCategorySelect = (subCategoryId) => {
		navigate(`/store/categories/${subCategoryId}`);
	};

	return (
		<div className='content-wrapper'>
			<Header />
			<Categories onCategorySelect={handleCategorySelect} />
			<EmptySpace size='xl' />
			<Popup id='popup-after-blogger-onboarding' isOpen={showPopupAfterBloggerOnboarding} onClose={() => setShowPopupAfterBloggerOnboarding(false)}>
				Теперь вы&nbsp;можете выбрать товар в&nbsp;одной из&nbsp;этих категорий и&nbsp;отправить селлеру заявку на&nbsp;рекламу по&nbsp;бартеру.
			</Popup>
		</div>
	)
}

export default StoreBlogger;