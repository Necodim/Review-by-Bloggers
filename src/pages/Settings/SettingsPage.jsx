import packageJson from '../../../package.json';
import React, { useEffect, useState } from 'react';
import { TonConnectButton } from '@tonconnect/ui-react';
import { useNavigate } from 'react-router-dom';
import { useUserProfile } from '../../hooks/UserProfileContext';
import { useToastManager } from '../../hooks/useToast';
import Input from '../../components/Form/Input';
import Button from '../../components/Button/Button';
import Link from '../../components/Button/Link';
import PopupConfirmation from '../../components/Popup/PopupConfirmation';

const SettingsPage = () => {
	const navigate = useNavigate();
	const { profile, updateUserData } = useUserProfile();
	const { showToast } = useToastManager();

	const [isPopupChangeRoleVisible, setIsPopupChangeRoleVisible] = useState(false);
	const [currentRole, setCurrentRole] = useState(profile.role);
	const [newRole, setNewRole] = useState(profile.role);

	useEffect(() => {
		setCurrentRole(profile.role);
		setNewRole(profile.role);
	}, [profile.role]);

	const radioOptions = [
		{ label: 'Селлер', value: 'seller', icon: 'store' },
		{ label: 'Блогер', value: 'blogger', icon: 'face_retouching_natural' },
	];

	const handleRadioChange = (value) => {
		if (profile.role !== value) {
			setNewRole(value);
			setIsPopupChangeRoleVisible(true);
		}
	}

	const closePopupWithoutChangeRole = () => {
		showToast('Роль не изменилась');
		setNewRole(currentRole);
		setIsPopupChangeRoleVisible(false);
	}

	const changeRole = async () => {
		try {
			await updateUserData({ role: newRole });
		} catch (error) {
			showToast('Ошибка при обновлении роли', 'error');
		}
	}

	return (
		<div className='content-wrapper'>
			<div className='container' id='settings'>
				<div className='list'>
					<div className='list-item'>
						<div className='list'>
							<div className='list-item'>
								<h1>Настройки</h1>
							</div>
							<div className='list-item'>
								<small>{'Ваш ID: ' + profile.id}</small>
							</div>
						</div>
						<div className='list-item justify-content-end'>
							<TonConnectButton />
						</div>
					</div>
				</div>
				<div className='list'>
					{profile && profile.role &&
						<Input
							id='settings-role'
							title='Роль'
							type='radio'
							options={radioOptions}
							onChange={handleRadioChange}
							selectedValue={newRole}
						/>
					}
					<Button onClick={() => { navigate('/info/support') }} icon='support_agent'>Поддержка</Button>
					<Link onClick={() => { navigate('/info/user-agreement') }}>Пользовательское соглашение</Link>
				</div>
				<small>Версия: {packageJson.version}</small>
			</div>

			<PopupConfirmation
				id='popup-change-role-confirmation'
				title='Изменение роли'
				text='Вы действительно хотите изменить роль?'
				descr='После смены роли вы не потеряете свои данные. Её можно будет точно так же изменить в будущем через настройки.'
				isOpen={isPopupChangeRoleVisible}
				onClose={closePopupWithoutChangeRole}
				onConfirmation={changeRole}
				timer={4}
			/>
		</div>
	)
}

export default SettingsPage;
