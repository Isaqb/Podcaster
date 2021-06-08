import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { GetStaticPaths, GetStaticProps } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import Head from 'next/head';
import { usePlayer } from '../../context/PlayerContext';
import { api } from '../../services/api';
import { convertDurationToTimeString } from '../../utils/convertDurationToTimeString';
import styles from '../styles/episode.module.scss';

type Episode = {
    id: string;
    title: string;
    thumbnail: string;
    description: string;
    member: string;
    duration: number;
    durationAsString: string;
    url: string;
    published_at: string;
  }
  
  type EpisodeProps ={
    episode: Episode;
  }

export default function Episode({ episode }: EpisodeProps){
    const { play } = usePlayer();
   
    return (
        <div className={styles.episode}>
            <Head>
                <title>{episode.title}</title>
            </Head>
            <div className={styles.thumbnailContainer}>
                <Link href="/">
                    <button type='button'>
                        <img src="/arrow-left.svg" alt="Voltar"/>
                    </button>
                </Link>
                
                <Image
                    width={700}
                    height={160}
                    src={episode.thumbnail}
                    objectFit="cover"
                />
                <button type="button" onClick={()=>play(episode)}>
                    <img src="/play.svg" alt="Tocar episodio"/>
                </button>
            </div>
                <h1>{episode.title}</h1>
                <span>{episode.member}</span>
                <span>{episode.published_at}</span>
                <span>{episode.durationAsString}</span>
            <header>

                <div 
                    className={styles.description}
                    dangerouslySetInnerHTML={{__html:episode.description}}
                >
                </div>

            </header>

        </div>
    )
}


export const getStaticPaths: GetStaticPaths = async () =>{
    const { data } = await api.get('episodes',{
        params:{
          _limit: 12,
          _sort: 'published_at',
          _order: 'desc'
        }
    })

    const paths = data.map(episode =>{//mais acessadas em pre carregamento
            return{
                params:{
                    slug: episode.id
                }
            }
    })
    return{
        paths,// paginas pre carregadas- normalmente as mais acessadas   
        fallback: 'blocking' //gera novas paginas conforme acessadas
    }
}

export const getStaticProps: GetStaticProps = async (ctx)=>{

    const  { slug } = ctx.params;

    const { data } = await api.get(`/episodes/${slug}`)

    const episode = {
      id: data.id,
      title: data.title,
      thumbnail: data.thumbnail,
      member: data.members,
      published_at: format(parseISO(data.published_at), 'd MM yy',{ locale:ptBR }),
      duration: Number(data.file.duration),
      durationAsString: convertDurationToTimeString(Number(data.file.duration)),
      description: data.description,
      url: data.file.url,
    }

    return{
        props: {
            episode
        },
        revalidate: 60 * 60 * 24, //24 horas
    }
}