import React, { useEffect, useState } from 'react';
import '../Barters.css';
import { useNavigate } from 'react-router-dom';
import api from '../../../api/api';
import { useToastManager } from '../../../hooks/useToast';
import { useHelpers } from '../../../hooks/useHelpers';
import Header from '../../Header/Header';
import PreloaderContainer from '../../Preloader/PreloaderContainer';
import Link from '../../Button/Link';
import BartersGrid from '../BartersGrid';
import { useUserProfile } from '../../../hooks/UserProfileContext';

const SellerBartersPage = () => {
  const navigate = useNavigate();
  const { profile } = useUserProfile();
  const { showToast } = useToastManager();
  const { sortBy } = useHelpers();

  const [errorMessage, setErrorMessage] = useState('');
  const [isApi, setIsApi] = useState(false);
  const [barterOffers, setBarterOffers] = useState([]);
  const [offersIsLoading, setOffersIsLoading] = useState(true);
  const [queOffers, setQueOffers] = useState([]);
  const [newOffers, setNewOffers] = useState([]);
  const [progressOffers, setProgressOffers] = useState([]);
  const [completedOffers, setCompletedOffers] = useState([]);

  useEffect(() => {
    if (errorMessage) {
      showToast(errorMessage, 'error');
      setErrorMessage('');
    }
  }, [errorMessage, showToast]);

  useEffect(() => {
    if (profile) {
      setIsApi(!!profile.api?.wildberries?.token);
    }
  }, [profile]);

  useEffect(() => {
    const fetchOffers = async () => {
      setOffersIsLoading(true);
      try {
        const offers = await api.getBarterOffersByCurrentSeller();
        setBarterOffers(offers);
        const responseQueOffers = offers.filter(offer => ['queued'].includes(offer.status));
        const responseNewOffers = offers.filter(offer => ['created'].includes(offer.status));
        const responseProgressOffers = offers.filter(offer => ['sended', 'progress', 'planned', 'reported'].includes(offer.status));
        const responseCompletedOffers = offers.filter(offer => ['closed', 'refused'].includes(offer.status));
        setQueOffers(sortBy(responseQueOffers, 'updated_at'));
        setNewOffers(sortBy(responseNewOffers, 'updated_at'));
        setProgressOffers(sortBy(responseProgressOffers, 'updated_at'));
        setCompletedOffers(sortBy(responseCompletedOffers, 'updated_at'));
        setOffersIsLoading(false);
      } catch (error) {
        setErrorMessage(error.message);
      } finally {
        setOffersIsLoading(false);
      }
    }
    fetchOffers();
  }, []);

  const openBarter = (barter) => {
    navigate(`${barter.id}`, {state: { barter: barter }});
  }

  const goToBartersType = (type, offers) => {
    navigate(`/barters/type/${type}`, {state: { offers: offers }});
  }

  const createCards = (offers, type, title) => {
    if (offers.length > 0) {
      return (
        <div className='container' id={`offers-${type}`} >
          <div className='list'>
            <div className='list-item'>
              <h1>{title}</h1>
              <Link onClick={() => goToBartersType(type, offers)}>Ещё</Link>
            </div>
          </div>
          <BartersGrid offers={offers.slice(0, 2)} />
        </div>
      );
    } else {
      return;
    }
  }

  if (!isApi) {
    return <PreloaderContainer title='Нет API' text='Вы не добавили API. Сначала добавьте API маркетплейса, после чего загрузятся ваши товары, и вы сможете создать бартеры. Отклики от блогеров появятся тут.' />
  } else if (offersIsLoading) {
    return <PreloaderContainer text='Секундочку, загружаю ваши бартеры...' />
  } else if (newOffers.length === 0 && progressOffers.length === 0 && completedOffers.length === 0) {
    return <PreloaderContainer title='Нужно подождать...' text='У вас пока нет предложений от блогеров.' />
  }

  return (
    <div className='content-wrapper'>
      <Header />
      {createCards(newOffers, 'new', 'Новые')}
      {createCards(progressOffers, 'progress', 'В работе')}
      {/* {createCards(queOffers, 'que', 'В ожидании')} */}
      {createCards(completedOffers, 'completed', 'Завершённые')}
    </div>
  );
}

export default SellerBartersPage;