import { useRef, useEffect, useState } from 'react';
import { PlayerContext, usePlayer } from '../../context/PlayerContext';
import Image from 'next/image';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import styles from './styles.module.scss';
import { convertDurationToTimeString } from '../../utils/convertDurationToTimeString';

export function Player(){
    const audiRef = useRef<HTMLAudioElement>(null);

    const [progress, setProgress] = useState(0);

    const { 
        episodeList,
        currentEpisodeIndex,
        isPlaying,
        togglePlay,
        setPlayingState,
        playNext,
        playPrevious,
        clearPlayState,
        hasNext,
        hasPrevious,
        isLooping,
        toggleLoop,
        isShuffling,
        toggleShuffle
    } = usePlayer()

    useEffect(() => {
        if(!audiRef.current){
            return;
        }
        if(isPlaying){
            audiRef.current.play();
        } else{
            audiRef.current.pause();
        }
    },[isPlaying])

    function setupProgressListener(){
        audiRef.current.currentTime = 0;
        audiRef.current.addEventListener('timeupdate', () =>{
            setProgress(Math.floor(audiRef.current.currentTime));
        });
    }

    function handleSee(amount: number){
        audiRef.current.currentTime = amount;
        setProgress(amount);
    }


    function handleEpisodeEnded(){
        if(hasNext){
            playNext();
        }else {
            clearPlayState();
        }
    }

    const episode = episodeList[currentEpisodeIndex]

    return(
        <div className={styles.playerContainer}>
            <header>
                <img src="/playing.svg" alt="Tocando agora" />
                <strong>Tocando agora </strong>
            </header>
            
            {episode ? (
                <div className={styles.currentEpisode}>
                    <Image 
                        width={592} 
                        height={592} 
                        src={episode.thumbnail} 
                        objectFit='cover' 
                    />
                    <strong>{episode.title}</strong>
                    <span>{episode.member}</span>
                </div>

            ): (
                <div className={styles.emptyPlayer}>
                    <strong>Selecione um podcast para ouvir</strong>
                </div>
            )}

            <footer className={!episode ? styles.empty : ''}>
                <div className={styles.progress}>
                <span>{convertDurationToTimeString(progress)}</span>
                    <div className={styles.slider}>
                        {episode?(
                            <Slider
                                max={episode.duration}
                                value={progress}
                                onChange={handleSee}
                                trackStyle={{backgroundColor:`#04d361`}}
                                railStyle={{backgroundColor:`#9f75ff`}}
                                handleStyle={{borderColor:`#04d361`,borderWidth:4}}
                            />
                        ):(
                            <div className={styles.emptySlider}/>
                        )}
                        
                       
                    </div>
                    <span>{convertDurationToTimeString(episode?.duration ?? 0)}</span>
                </div>

                            {episode && (
                                <audio 
                                    src={episode.url}
                                    ref={audiRef}
                                    autoPlay
                                    onEnded={handleEpisodeEnded}
                                    loop={isLooping}
                                    onPlay={()=> setPlayingState(true)}
                                    onPause={()=> setPlayingState(false)}
                                    onLoadedMetadata={setupProgressListener}
                                />
                            ) }

                <div className={styles.buttons}>
                    <button 
                        onClick={toggleShuffle}
                        type="button" 
                        disabled={!episode || episodeList.length===1}
                        className={isShuffling ? styles.isActive:''}
                    >
                        <img src="/shuffle.svg" alt="Embaralhar"/>
                    </button>
                    <button type="button" onClick={playPrevious} disabled={!episode || !hasPrevious}>
                        <img src="/play-previous.svg" alt="Tocar anterior"/>
                    </button>
                    <button 
                        type="button" 
                        className={styles.playButton} 
                        disabled={!episode}
                        onClick={togglePlay}
                    >
                        { isPlaying
                            ? <img src="/pause.svg" alt="Pausar"/>
                            : <img src="/play.svg" alt="Tocar"/>
                        }
                    </button>
                    <button type="button" onClick={playNext} disabled={!episode || !hasNext}>
                        <img src="/play-next.svg" alt="Proxima"/>
                    </button>
                    <button 
                        type="button" 
                        onClick={toggleLoop} 
                        disabled={!episode}
                        className={isLooping ? styles.isActive:''}
                    >
                        <img src="/repeat.svg" alt="Repetir"/>
                    </button>
                </div>
            </footer>
        </div>
    );
}