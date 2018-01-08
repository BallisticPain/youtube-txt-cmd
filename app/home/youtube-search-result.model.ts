interface IYoutubeSearchResult {
  id?: { videoId?: string };
  snippet?: { 
    title?: string;
    thumbnails?: { 
      default?: { 
        url?: string; 
        width?: number; 
        height?: number; 
      }
    }
  }
}

interface IYoutubeResult {
  items?: IYoutubeSearchResult[];
}

interface IVideoResult {
  videoId?: string;
  title?: string;
  image?: {
    url?: string;
    width?: number;
    height?: number;
  };
}