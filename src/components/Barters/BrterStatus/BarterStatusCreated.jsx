import React, { useEffect, useState } from 'react';
import { useUserProfile } from '../../../hooks/UserProfileContext';
import { useToastManager } from '../../../hooks/useToast';
import api from '../../../api/api';
import Button from '../../Button/Button';
import Form from '../../Form/Form';
import Input from '../../Form/Input';
import PopupOfferRefuseReason from '../../Popup/PopupOfferRefuseReason';

const BarterStatusCreated = ({ offer, updateOffer }) => {
  const { role } = useUserProfile();
  const { showToast } = useToastManager();
  
  const [errorMessage, setErrorMessage] = useState('');
  const [text, setText] = useState(null);
  const [formScreenshot, setFormScreenshot] = useState(null);
  const [file, setFile] = useState(null);
  const [fileLoading, setFileLoading] = useState(false);
  const [fileError, setFileError] = useState(null);
  const [btnRefuseDisabled, setBtnRefuseDisabled] = useState(false);
  const [isPopupRefuseOpen, setIsPopupRefuseOpen] = useState(false);

  useEffect(() => {
    if (errorMessage) {
      showToast(errorMessage, 'error');
      setErrorMessage('');
    }
  }, [errorMessage, showToast]);

  useEffect(() => {
    switch (role) {
      case 'blogger':
        setText('Вы отправили предложение о бартере, но селлер ещё не принял его.');
        break;
      case 'seller':
        setText(`Блогер отправил предложение о бартере. Ознакомьтесь с его профилем (кнопка выше) и, если вас всё устроит, отправьте блогеру на карту средства ${!!offer?.order_price ? `(в размере ${offer?.order_price}₽ с учётом доставки) ` : ''}для покупки товаров. После чего подтвердите перевод средств.`);
        break;
    }
  }, [role, offer]);

  const handleChangeScreenshot = (file) => {
    setFile(file);
    setFileError(null);
  };

  const uploadScreenshot = async (formData) => {
    try {
      setFileLoading(true);
      setBtnRefuseDisabled(true);
      const response = await api.uploadReceipt(offer.barter.id, formData);
      setFormScreenshot(response);
      return response;
    } catch (error) {
      const message = 'Ошибка при загрузке скриншота';
      console.error(`${message}:`, error);
      setFileError(message);
      throw Error('Не удалось загрузить изображение');
    } finally {
      setFileLoading(false);
      setBtnRefuseDisabled(false);
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setFileError('Выберите файл для загрузки');
      return
    }
    
    const formData = new FormData();
    formData.append('receipt', file);
    
    try {
      setFileLoading(true);
      setBtnRefuseDisabled(true);
      const uploadedFile = await uploadScreenshot(formData);
      setFormScreenshot(uploadedFile);
      const data = {
        offerId: offer.id,
        status: offer.status,
        receipt: uploadedFile,
        seller_id: offer.barter?.user_id,
        blogger_id: offer.user_id,
      }
      const updatedOffer = await api.updateBarterOffer(data);
      updateOffer(prev => ({
        ...prev,
        status: updatedOffer.status,
        receipt_seller: uploadedFile,
      }));
      showToast('Вы приняли предложение от блогера', 'success');
    } catch (error) {
      console.error(error);
      setErrorMessage(error.message);
    } finally {
      setFileLoading(false);
      setBtnRefuseDisabled(false);
    }
  };

  const openPopupRefuse = () => {
    setIsPopupRefuseOpen(true);
  }

  const closePopupRefuse = () => {
    setIsPopupRefuseOpen(false);
  }

  return (
    <div className='list gap-xl'>
      <h1>Предложение создано</h1>
      <p>{text}</p>
      {role === 'seller' &&
        <div className='list gap-xl'>
          <div className='list-item vertical'>
            <Form
              onSubmit={handleSubmit}
              isDisabled={fileLoading}
            >
              <Input
                type='file'
                id='receipt'
                name='receipt'
                title='Скриншот перевода *'
                value={formScreenshot}
                onChange={handleChangeScreenshot}
                required={true}
                error={fileError}
                comment={!!offer?.order_price ? offer?.order_price + '₽ (с учётом доставки)' : 'Уточните сумму у блогера'}
              />
            </Form>
          </div>
          <div className='list-item vertical'>
            <p>Или отклоните предложение</p>
            <Button className='error w-100' onClick={openPopupRefuse} disabled={btnRefuseDisabled}>Отклонить предложение</Button>
          </div>
          <PopupOfferRefuseReason
            isOpen={isPopupRefuseOpen}
            onClose={closePopupRefuse}
            offer={offer}
          />
        </div>
      }
      {/* {role === 'blogger' &&
        
      } */}
    </div>
  );
}

export default BarterStatusCreated;