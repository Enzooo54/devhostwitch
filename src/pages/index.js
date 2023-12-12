import Head from 'next/head'
import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import axios from 'axios';
const logo = '/logo-dev.png';
import style from '../styles/Home.module.css'



function App() {
    // toutes les variables d'état
    const [streamer, setStreamer] = useState('');
    const [streamerInfo, setStreamerInfo] = useState(null);
    const [followers, setFollowers] = useState(null);
    const [isLive, setIsLive] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [currentStreamInfo, setCurrentStreamInfo] = useState(null);
    const [showStreamerInfo, setShowStreamerInfo] = useState(true);
    const [searchHistory, setSearchHistory] = useState([]);
    const [showHistory, setShowHistory] = useState(false);
    const [isRotated, setIsRotated] = useState(false);

    const handleDivClick = () => {
        setShowHistory(!showHistory);
        const historiqueDiv = document.querySelector('.historique');
        historiqueDiv.classList.toggle('active');
        setIsRotated(!isRotated);
    };
    // toutes les fonctions
    const fetchCurrentStreamInfo = async () => {
            setIsLoading(true);
            setCurrentStreamInfo(null);
            setShowStreamerInfo(false);
            const tokenResponse = await axios.post(`https://id.twitch.tv/oauth2/token?client_id=m61e2ipymhxnzmj7mqgpve3cp6ii22&client_secret=u8qtelwt59996c4g9jhrza0qnfuzid&grant_type=client_credentials`);
            const accessToken = tokenResponse.data.access_token;

            const streamResponse = await axios.get(`https://api.twitch.tv/helix/streams?user_login=${streamer}`, {
            headers: {
                    'Client-ID': 'm61e2ipymhxnzmj7mqgpve3cp6ii22',
                    'Authorization': `Bearer ${accessToken}`
            }
            });

            if (streamResponse.data.data.length > 0) {
                setCurrentStreamInfo(streamResponse.data.data[0]);
                setShowStreamerInfo(false);
            }
            setIsLoading(false); 
    };

    const displayStreamerInfo = () => {
    setShowStreamerInfo(true);
    setCurrentStreamInfo(null);
    }
    useEffect(() => {
        let history = Cookies.get('searchHistory');
        if (history) {
            history = JSON.parse(history);
            setSearchHistory(history);
        }
    }, []);
    const fetchStreamerInfo = async () => {
    if (!streamer) {
        return;
    }
    setIsLoading(true);
    let history = Cookies.get('searchHistory');
    if (history) {
        history = JSON.parse(history);
    } else {
        history = [];
    }
    history.unshift(streamer);
    if (history.length > 10) {
        history.pop();
    }

    setSearchHistory(history);
    Cookies.set('searchHistory', JSON.stringify(history));
    setShowStreamerInfo(true);
    const tokenResponse = await axios.post(`https://id.twitch.tv/oauth2/token?client_id=m61e2ipymhxnzmj7mqgpve3cp6ii22&client_secret=u8qtelwt59996c4g9jhrza0qnfuzid&grant_type=client_credentials`);
    const accessToken = tokenResponse.data.access_token;

    const result = await axios.get(`https://api.twitch.tv/helix/users?login=${streamer}`, {
      headers: {
        'Client-ID': 'm61e2ipymhxnzmj7mqgpve3cp6ii22',
        'Authorization': `Bearer ${accessToken}`
      }
    });
    

    if (result.data.data[0]) {
      setStreamerInfo(result.data.data[0]);

      const followerResponse = await axios.get(`https://api.twitch.tv/helix/channels/followers?broadcaster_id=${result.data.data[0].id}`, {
        headers: {
          'Client-ID': 'm61e2ipymhxnzmj7mqgpve3cp6ii22',
          'Authorization': `Bearer ${accessToken}`
        }
      });

      const streamResponse = await axios.get(`https://api.twitch.tv/helix/streams?user_login=${streamer}`, {
        headers: {
          'Client-ID': 'm61e2ipymhxnzmj7mqgpve3cp6ii22',
          'Authorization': `Bearer ${accessToken}`
        }
      });

      const isLive = streamResponse.data.data.length > 0;

      setIsLive(isLive);

      setFollowers(followerResponse.data.total);
    } else {
      console.log('No data returned from Twitch API');
    }
    setIsLoading(false);
  };
// le rendu
return (
  <>
    <Head>
      <title>DevHosterTwitch</title>
      <meta name="description" content="Recherche de Streamer" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="shortcut icon" type="image/png" href={logo}/>
    </Head>
    <div>
        <div className={style.App}>
        <div className={`historique ${showHistory ? 'active' : ''}`}>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className={style.svg}
                onClick={handleDivClick}
                style={{ transform: isRotated ? 'rotate(90deg)' : 'none', transition: 'transform 0.3s ease' }}
            >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7"></path>
            </svg>
            
        <ul className={style.ul} key={searchHistory.length}>
            <h3 className={style.h3}>Historique</h3>
            {searchHistory.map((item, index) => (
                    <li className={style.li} key={index} onClick={() => {
                    setStreamer(item);
                    fetchStreamerInfo();
                }}>
                {item}
                </li>
            ))}
            <button className='clear' onClick={() => {
            Cookies.remove('searchHistory');
            setSearchHistory([]);
            Cookies.set('searchHistory', JSON.stringify([]));
        }}>
            Effacer l'historique
            </button>
    </ul>
        </div>
            <h1 className={style.h1}>DevHosterTwitch<a className='discord' href='https://discord.gg/W4rAPs2ehQ' target='_blank' rel="noreferrer"><img className='logo' src={logo} alt='logo'></img></a></h1>
            <input className={style.input} type="text" value={streamer} onChange={e => setStreamer(e.target.value)} />
            <button className='binfo' onClick={fetchStreamerInfo}>Informations du Streamer</button>
            {isLoading ? (
                <div className="loader"></div>
            ) : showStreamerInfo ? (
                streamerInfo && (
                    <div>
                        <h2 className={style.h2}>
                            <a className='twitch' href={`https://www.twitch.tv/${streamerInfo.display_name}`} target="_blank" rel="noopener noreferrer">
                            {streamerInfo.display_name}
                            </a>
                        </h2>
                        <img className='streamer-image' src={streamerInfo.profile_image_url} alt={streamerInfo.display_name} />
                        <p className={style.p}>{streamerInfo.description}</p>
                        <p className={style.p}>ID: {streamerInfo.id}</p>
                        <p className={style.p}>Date de création du compte: {new Date(streamerInfo.created_at).toLocaleDateString('fr-FR')}</p>
                        <p className={style.p}>Type de diffuseur: {streamerInfo.broadcaster_type}</p>
                        <p className={style.p}>Followers: {followers && followers.toLocaleString('fr-FR')}</p>
                        <p className={style.p}>En live : {isLive ? 'Oui' : 'Non'} </p>
                        {isLive ?<button className='stream' onClick={fetchCurrentStreamInfo}>Informations du live</button> : null}
                    
                    </div>
                
                )
            ) : (
                currentStreamInfo && (
                    <div>
                    <h3>{currentStreamInfo.title}</h3>
                    <p>Nombre de viewers: {currentStreamInfo.viewer_count}</p>
                    <p>Nom du jeu: {currentStreamInfo.game_name}</p>
                    <p>Commencé le: {new Date(currentStreamInfo.started_at).toLocaleDateString('fr-FR')}</p>
                    <p>Heure de début: {new Date(currentStreamInfo.started_at).toLocaleTimeString('fr-FR')}</p>
                    <p>Langue: {currentStreamInfo.language}</p>
                    <p>Mature: {currentStreamInfo.is_mature ? 'Oui' : 'Non'}</p>
                    <p>Image du live :</p><img src={currentStreamInfo.thumbnail_url.replace('{width}', '480').replace('{height}', '300')} alt="Stream thumbnail" />
                    <button className='retour' onClick={displayStreamerInfo}>Retour aux informations du streamer</button>
                </div>
            )
            )}
            <footer className={style.footer}>
                <p>© Developpé par <a className={style.a} href='https://github.com/Enzooo54' target='_blank' rel="noopener noreferrer">Enzo</a> 👨‍💻 Tous les droits sont réservés à DevHoster.</p>
            </footer>
        </div>
    </div>
  </>
);
}

export default App;