import {Component, ElementRef, ViewChild} from '@angular/core';
import {AudioContext} from 'angular-audio-context';
import {IAudioContext, IGainNode, IMediaElementAudioSourceNode} from 'standardized-audio-context';

@Component({
    selector: 'app-project-page',
    templateUrl: './project-page.component.html',
    styleUrls: ['./project-page.component.scss']
})
export class ProjectPageComponent {
    @ViewChild('volume') volume?: ElementRef;

    beatPath: string = '../../../assets/audio/beat.mp3';
    voicePath: string = '../../../assets/audio/voice.wav';

    gainNode: IGainNode<IAudioContext>;
    beatSource?: IMediaElementAudioSourceNode<AudioContext>;
    voiceSource?: IMediaElementAudioSourceNode<AudioContext>;

    constructor(private _audioContext: AudioContext) {
        this.gainNode = _audioContext.createGain();
    }

    public async playSound(): Promise<void> {
        if (this._audioContext.state === 'suspended') {
            await this._audioContext.resume();
        }

        //const gain = this._audioContext.createGain();//
        const oscillatorNode = this._audioContext.createOscillator();
        oscillatorNode.connect(this.gainNode);//

        oscillatorNode.frequency.value = 150;
        this.gainNode.gain.value = this.volume?.nativeElement.value;
        //gain.gain.setValueAtTime(1, this._audioContext.currentTime + 1);

        oscillatorNode.start(0);
        this.gainNode.connect(this._audioContext.destination);
        oscillatorNode.stop(this._audioContext.currentTime + 0.5);

        const beatAudioElement = document.createElement('audio');
        beatAudioElement.setAttribute('src', this.beatPath);
        this.beatSource = this._audioContext.createMediaElementSource(beatAudioElement);
        this.beatSource.connect(this.gainNode);
        this.gainNode.connect(this._audioContext.destination);
        this.beatSource?.mediaElement.play();

        const voiceAudioElement = document.createElement('audio');
        voiceAudioElement.setAttribute('src', this.voicePath);
        this.voiceSource = this._audioContext.createMediaElementSource(voiceAudioElement);
        this.voiceSource.connect(this.gainNode);
        this.gainNode.connect(this._audioContext.destination);
        this.voiceSource?.mediaElement.play();
    }

    startSound(event: Event) {
        this.playSound();
    }

    changeVolume(volume: any) {
        this.gainNode.gain.value = volume * 2;
    }

    stopSound() {
        this.beatSource?.mediaElement.pause();
        this.voiceSource?.mediaElement.pause();
    }
}
