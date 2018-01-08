import { ItemEventData } from "ui/list-view"
import { SearchBar } from "ui/search-bar";
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CFAlertDialog,
    DialogOptions,
    CFAlertGravity,
    CFAlertActionAlignment,
    CFAlertActionStyle,
    CFAlertStyle } from 'nativescript-cfalert-dialog';
import ApiClient = require('nativescript-apiclient');
import { Volume } from 'nativescript-volume';

@Component({
    selector: "Home",
    moduleId: module.id,
    templateUrl: "./home.component.html",
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
    @ViewChild("vplayer") vplayer: ElementRef;
    command: string = "";
    searchPhrase: string = "";
    src: string = "";
    playerOptions: any = {
        controls: 0,
        playsinline: 1,
        enablejsapi: 1,
    };
    isLoading: boolean = false;
    videoResults: IVideoResult[] = [
        { title: "Search to find videos", image: { url: "https://d2an5carukjfes.cloudfront.net/tutorials/groceries-ng/images/nativescript-logo.png?t=1.9.777" }},
    ];
    searchResults: IYoutubeSearchResult[];
    commandHelpDialog = new CFAlertDialog();
    commandHelpMessages = {
        general: 'All commands have shortcuts and/or aliases. Shortcuts and aliases are denoted in square brackets.\n\n',
        help: 'help - [h, ?, commands, list]\n',
        search: 'search <search terms here> - [s]\n',
        load: 'load <list index> - [l]\n',
        loadplay: 'loadplay <list index> - [lp]\n',
        play: 'play - [pl]\n',
        pause: 'pause - [p]\n',
        stop: 'stop - [st]\n',
        mute: 'mute - [m]\n',
        unmute: 'unmute - [un]\n',
        volume: 'volume <up|down|mute|unmute> - [v u, v d, v dn, v m, v un]',
    }
    commandHelpOptions: DialogOptions = {
        dialogStyle: CFAlertStyle.BOTTOM_SHEET,
        title: "Command List",
        textAlignment: CFAlertGravity.START,
        message: this.commandHelpMessages.general + this.commandHelpMessages.help + 
                 this.commandHelpMessages.search + this.commandHelpMessages.load +
                 this.commandHelpMessages.play +
                 this.commandHelpMessages.pause + this.commandHelpMessages.stop + 
                 this.commandHelpMessages.mute + this.commandHelpMessages.unmute + 
                 this.commandHelpMessages.volume
    }
    searchBaseUrl: string = "https://www.googleapis.com/youtube/v3/search";
    searchSnippet: string = "snippet";
    searchMaxResults: number = 5;
    searchType: string = "video";
    searchVideoEmbeddable: boolean = true;
    searchFields: string = "items(id/videoId,snippet(thumbnails/default,title))";
    searchApiKey: string = "AIzaSyBoMnOvlzzA49hmTKRY9EOQEx62ktj5dWc";

    volume: Volume = new Volume();

    constructor() {
    }

    ngOnInit(): void {
    }

    onItemTap(args: ItemEventData): void {
        console.log('Item with index: ' + args.index + ' tapped');
        // Thinking it should load the text into the command line for us on click
        // If load is already in the command box with the correct index, it should put the "play" command in
        const cmdInfo = this.getCommandInfo();
        const cmdLoad = 'load ' + args.index;
        switch (cmdInfo.cmd) {
            case 'load':
                if (cmdInfo.params == args.index.toString()) {
                    // Move forward to the play
                    this.command = 'play';
                } else {
                    this.command = cmdLoad;
                }
                break;
            default:
                this.command = cmdLoad;
                break;
        }
    }

    onSearchSubmit(args): void {
        let searchBar = <SearchBar>args.object;
        console.log("SearchBar search " + searchBar.text);

        this.command = "s " + searchBar.text;
        this.searchYouTube(searchBar.text);
    }

    onGoTap(): void {
        console.log("User wants to send command!");

        const cmdInfo = this.getCommandInfo();
        console.log('cmd', cmdInfo.cmd, 'arg', cmdInfo.params);

        switch (cmdInfo.cmd.toLowerCase()) {
            case 'h':
            case '?':
            case 'commands':
            case 'list':
            case 'help':
                this.onHelpTap();
                break;
            case 's':
            case 'search':
                this.searchYouTube(cmdInfo.params);
                break;
            case 'l':
            case 'load':
                this.loadVideoToPlayer(cmdInfo.params);
                break;
            case 'lp':
            case 'loadplay':
                this.loadVideoToPlayer(cmdInfo.params);
                this.playVideo();
                break;
            case 'pl':
            case 'play':
                this.playVideo();
                break;
            case 'st':
            case 'stop':
                this.vplayer.nativeElement.stop();
                break;
            case 'p':
            case 'pause':
                this.vplayer.nativeElement.pause();
                break;
            case 'm':
            case 'mute':
                this.muteVolume();
                break;
            case 'un':
            case 'unmute':
                this.unmuteVolume();
                break;
            case 'v':
            case 'vol':
            case 'volume':
                switch (cmdInfo.params.toLowerCase()) {
                    case 'u':
                    case 'up':
                        this.increaseVolume();
                        break;
                    case 'd':
                    case 'dn':
                    case 'down':
                        this.decreaseVolume();
                        break;
                    case 'm':
                    case 'mute':
                        this.muteVolume();
                        break;
                    case 'un':
                    case 'unmute':
                        this.unmuteVolume();
                        break;
                }
        }
    }

    onHelpTap(): void {
        this.commandHelpDialog.show(this.commandHelpOptions);
    }

    decreaseVolume(): void {
        console.log('attempted to decrease volume');
        this.volume.volumeDown();
    }

    getCommandInfo() {
        let params: string;
        const cmdSplit: string[] = this.command.split(' ');
        const cmd: string = cmdSplit[0];

        if (cmdSplit.length > 1) {
            params = this.command.substring(cmd.length + 1);
        }

        return {
            cmd: cmd,
            params: params,
        };
    }

    increaseVolume() {
        console.log('attempted to increase volume');
        this.volume.volumeUp();
    }

    loadVideoToPlayer(videoIndex: string): void {
        // if (this.src == 'wH_0_pijbZY') {
        //     this.src = 'vEG4qNW33mA';
        // } else {
        //     this.src = 'wH_0_pijbZY';
        // }
        console.log('videoIndex', videoIndex);
        this.src = this.videoResults[videoIndex].videoId;
    }

    muteVolume(): void {
        console.log('attempted to mute');
        this.volume.mute();
    }

    playVideo(): void {
        this.vplayer.nativeElement.play();
        if (this.vplayer.nativeElement.isFullscreen) {
            this.vplayer.nativeElement.toggleFullscreen();
        }
    }

    searchYouTube(searchPhrase: string): void {
        let that = this;
        let client = ApiClient.newClient({
            baseUrl: this.searchBaseUrl
        });

        const noVevoSearch = ' -' + searchPhrase.replace(' ', '') + 'vevo';
        const alternativeNoVevo = ' -"(C)"';

        client.get({
            params: {
                part: this.searchSnippet,
                maxResults: this.searchMaxResults,
                videoEmbeddable: this.searchVideoEmbeddable,
                type: this.searchType,
                fields: this.searchFields,
                key: this.searchApiKey,
                q: searchPhrase + alternativeNoVevo
            }
        });

        client.success((result: ApiClient.IApiClientResult) => {
            let results = result.getJSON<IYoutubeResult>();
            let videoResults: IVideoResult[] = [];
            let index = 0;
            for (let itemResult of (results.items as IYoutubeSearchResult[])) {
                videoResults.push({
                    videoId: itemResult.id.videoId || null,
                    title: itemResult.snippet.title || null,
                    image: {
                        url: itemResult.snippet.thumbnails.default.url || null,
                        width: itemResult.snippet.thumbnails.default.width || null,
                        height: itemResult.snippet.thumbnails.default.height || null,
                    }
                });
            }
            
            that.videoResults = videoResults;
        });
    }

    unmuteVolume(): void {
        console.log('attempted to unmute');
        this.volume.unmute();
    }
}
