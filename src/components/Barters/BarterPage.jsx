import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import './Barters.css';
import moment from 'moment';
import api from '../../api/api';
import { useUserProfile } from '../../hooks/UserProfileContext';
import { useToastManager } from '../../hooks/useToast';
import { useHelpers } from '../../hooks/useHelpers';
import PreloaderPage from '../Preloader/PreloaderPage';
import Header from '../Header/Header';
import Input from '../Form/Input';
import Button from '../Button/Button';
import BarterStatus from './BrterStatus/BarterStatus';
import PopupTaskRead from '../Popup/PopupTaskRead';
import PopupBloggerInfo from '../Popup/PopupBloggerInfo';
import Icon from '../Icon/Icon';

const BarterPage = () => {
  const location = useLocation();

  const { barterId, offerId } = useParams();
  const { offer: offerFromLocationState } = location.state || {};

  const { profile, role } = useUserProfile();
  const { showToast } = useToastManager();
  const { copyToClipboard, getProductInfo } = useHelpers();

  const [errorMessage, setErrorMessage] = useState('');
  const [currentOffer, setCurrentOffer] = useState({});
  const [offerNumber, setOfferNumber] = useState(barterId + '-' + offerId);
  const [offerUnavailable, setOfferUnavailable] = useState(false);
  const [offerIsLoading, setOfferIsLoading] = useState(false);
  const [productNmid, setProductNmid] = useState('');
  const [productLink, setProductLink] = useState('');
  const [marketplaceShortName, setMarketplaceShortName] = useState('');
  const [bloggerId, setBloggerId] = useState(null);
  const [isPopupTaskReadVisible, setIsPopupTaskReadVisible] = useState(false);
  const [isPopupBloggerInfoOpen, setIsPopupBloggerInfoOpen] = useState(false);

  const offer = currentOffer || offerFromLocationState;
  if (import.meta.env.DEV) {
    console.log('offer = ', offer);
  }

  useEffect(() => {
    if (errorMessage) {
      showToast(errorMessage, 'error');
      setErrorMessage('');
    }
  }, [errorMessage, showToast]);

  const fetchOffer = async () => {
    setOfferIsLoading(true);
    try {
      const fetchedOffer = await api.getBarterOfferById(offerId);
      if (fetchedOffer) {
        setCurrentOffer(fetchedOffer);
        setOfferNumber(fetchedOffer.barter?.id + '-' + fetchedOffer.id);
      } else {
        throw new Error('Произошла ошибка при получении бартера');
      }
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setOfferIsLoading(false);
    }
  };

  useEffect(() => {
    if (!offerFromLocationState) {
      fetchOffer();
    }
  }, [offerId]);

  useEffect(() => {
    if (!!currentOffer && !!currentOffer[role] && profile.id !== currentOffer[role].id) {
      setOfferIsLoading(false);
      setOfferUnavailable(true);
    }
  }, [profile, role, currentOffer]);

  useEffect(() => {
    const setOfferInfo = async () => {
      setBloggerId(currentOffer.user_id);
      setProductNmid(currentOffer.product?.nmid);
      const info = await getProductInfo(currentOffer.product);
      setMarketplaceShortName(info.short);
      setProductLink(info.link);
    }
    if (!!currentOffer) {
      setOfferInfo();
    }
  }, [currentOffer]);

  useEffect(() => {
    if (!offer || (!!offer && !offer.hasOwnProperty('barter'))) {
      fetchOffer();
    }
  }, [offer]);

  const handleCopyProductNmid = () => {
    const result = copyToClipboard(productNmid, 'Вы скопировали артикул товара', 'Не удалось скопировать артикул товара');
    showToast(result.message, result.status);
  };

  const handleCopyOfferNumber = () => {
    const result = copyToClipboard(offerNumber, 'Вы успешно скопировали номер предложения', 'Скопировать номер предложения не удалось')
    showToast(result.message, result.status);
  }

  const openTask = () => {
    setIsPopupTaskReadVisible(true);
  }

  if (offerIsLoading) {
    return <PreloaderPage text='Бартер загружается...' />
  } else if (!currentOffer) {
    return <PreloaderPage title='Бартер не найден' text='Попробуйте ещё раз...' />
  }

  if (offerUnavailable) {
    return <PreloaderPage title='Нет доступа' text='Этот бартер вам недоступен.' />
  }

  return (
    <div className='content-wrapper'>
      <Header />
      <div className='container product-page' id='offer' data-offer-id={currentOffer?.id} data-product-id={currentOffer?.product?.nmid} data-product-brand={currentOffer?.product?.brand}>
        <div className='list gap-l'>
          <div className='list-item'>
            <div className='list'>
              <div className='list-item justify-content-start gap-xs'>
                <h1>Бартер № {offerNumber}</h1>
                <Icon icon='copy' onClick={handleCopyOfferNumber} />
              </div>
              <div className='list-item'>
                <small>Изменено: {moment(offer?.updated_at).format('DD.MM.YYYY в HH:mm')}</small>
              </div>
            </div>
          </div>
          <div className='list-item align-items-start'>
            <img className='product-image small' src={currentOffer?.product?.photos[0]} alt={currentOffer?.product?.title} />
            <div className='list gap-m'>
              <div className='list gap-xs'>
                <div className='list-item'>
                  <h2>{currentOffer?.product?.title}</h2>
                </div>
                {currentOffer?.product?.brand &&
                  <div className='list-item'>
                    <small>Бренд: {currentOffer?.product?.brand}</small>
                  </div>
                }
              </div>
              <div className='list-item gap-s'>
                <Input
                  id='product-nmid'
                  name='product-nmid'
                  value={productNmid}
                  onChange={() => { }}
                  readOnly={true}
                  fade={true}
                  icon='content_copy'
                  iconCallback={handleCopyProductNmid}
                  onClick={handleCopyProductNmid}
                />
                <Button className='secondary w-auto size-input' icon='launch' onClick={() => window.open(productLink, '_blank')}>{marketplaceShortName}</Button>
              </div>
            </div>
          </div>
          <div className='list'>
            <div className='list-item'>
              <Button className='light' icon='format_list_bulleted' onClick={openTask}>Смотреть ТЗ</Button>
              {role === 'seller' && <Button className='light' icon='contact_page' onClick={() => setIsPopupBloggerInfoOpen(true)}>О блогере</Button>}
            </div>
          </div>
        </div>
      </div>
      <div className='container barter-offer-status' id='status'>
        <BarterStatus key={currentOffer?.id + '-' + currentOffer?.status} offer={currentOffer} updateOffer={setCurrentOffer} />
      </div>

      {(!!offer?.barter?.task || !!offer?.barter?.brand_instagram || !!offer?.barter?.need_feedback) &&
        <PopupTaskRead
          isOpen={isPopupTaskReadVisible}
          onClose={() => setIsPopupTaskReadVisible(false)}
          barter={offer.barter}
        />
      }
      {role === 'seller' && bloggerId &&
        <PopupBloggerInfo isOpen={isPopupBloggerInfoOpen} onClose={() => setIsPopupBloggerInfoOpen(false)} userId={bloggerId} />
      }
    </div>
  );
};

export default BarterPage;
