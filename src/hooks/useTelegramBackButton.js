import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const BackButton = () => {
  const [canGoBack, setCanGoBack] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const tg = window.Telegram.WebApp;

  useEffect(() => {
    const handleHistoryChange = () => {
      setCanGoBack(window.history.length > 1);
    };

    handleHistoryChange();

    // Подписка на изменения истории
    const unlisten = () => {
      return () => {};
    };

    return () => {
      unlisten();
    };
  }, [location]);

  useEffect(() => {
    if (canGoBack) {
      tg.BackButton.show();
      tg.BackButton.onClick(() => navigate(-1));
    } else {
      tg.BackButton.hide();
    }
  }, [canGoBack, navigate, tg]);

  return null;
};

export default BackButton;