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
        //this.gainNode.gain.value = this.volume?.nativeElement.value;
        //gain.gain.setValueAtTime(1, this._audioContext.currentTime + 1);

        //oscillatorNode.start(0);
        this.gainNode.connect(this._audioContext.destination);
        //oscillatorNode.stop(this._audioContext.currentTime + 0.5);

        if (!this.beatSource) {
            const beatAudioElement = document.createElement('audio');
            beatAudioElement.setAttribute('src', this.beatPath);
            this.beatSource = this._audioContext.createMediaElementSource(beatAudioElement);
            this.beatSource.connect(this.gainNode);
            //this.gainNode.connect(this._audioContext.destination);
        }
        this.beatSource?.mediaElement.play();

        if (!this.voiceSource) {
            const voiceAudioElement = document.createElement('audio');
            voiceAudioElement.setAttribute('src', this.voicePath);
            this.voiceSource = this._audioContext.createMediaElementSource(voiceAudioElement);
            this.voiceSource.connect(this.gainNode);
            //this.gainNode.connect(this._audioContext.destination);
        }
        this.voiceSource?.mediaElement.play();

        const time = this._audioContext.currentTime;
        //debugger;
    }

    startSound() {
        this.changeVolume(this.volume?.nativeElement.value);
        this.playSound();
    }

    changeVolume(volume: any) {
        //this.gainNode.gain.value = volume * 2;
        volume *= 2;
        const stepCount = 10;
        const step = Math.abs(volume - this.gainNode.gain.value) / stepCount;
        if (step <= 0.001) {
            return;
        }
        let currentValue = this.gainNode.gain.value;
        const iterations = [];
        if (volume < currentValue) {
            while (volume < currentValue) {
                iterations.push(currentValue);
                currentValue -= step;
            }
        } else {
            while (volume > currentValue) {
                iterations.push(currentValue);
                currentValue += step;
            }
        }
        this.gainNode.gain.setValueCurveAtTime(iterations, this._audioContext.currentTime, 0.2);
    }

    stopSound() {
        this.beatSource?.mediaElement.pause();
        this.voiceSource?.mediaElement.pause();
    }

    resetAudio() {
        this.stopSound();
        this.beatSource = undefined;
        this.voiceSource = undefined;
    }
}
