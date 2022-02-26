import {AfterViewInit, Component, ElementRef, ViewChild} from '@angular/core';
import {AudioContext} from 'angular-audio-context';
import {IAnalyserNode, IAudioContext, IGainNode, IMediaElementAudioSourceNode} from 'standardized-audio-context';
import {CdkDragEnd} from "@angular/cdk/drag-drop";

@Component({
    selector: 'app-project-page',
    templateUrl: './project-page.component.html',
    styleUrls: ['./project-page.component.scss']
})
export class ProjectPageComponent implements AfterViewInit {
    @ViewChild('volume') private volume?: ElementRef;
    @ViewChild('canvas') private canvas?: ElementRef;
    @ViewChild('dropArea') private dropArea?: ElementRef;

    private canvasContext?: CanvasRenderingContext2D;

    beatPath: string = '../../../assets/audio/beat.mp3';
    voicePath: string = '../../../assets/audio/voice.wav';

    private readonly gainNode: IGainNode<IAudioContext>;
    private beatSource?: IMediaElementAudioSourceNode<AudioContext>;
    private voiceSource?: IMediaElementAudioSourceNode<AudioContext>;
    private audioBuffer?: AudioBuffer;

    constructor(private _audioContext: AudioContext) {
        this.gainNode = _audioContext.createGain();
    }

    ngAfterViewInit() {
        this.canvasContext = this.canvas?.nativeElement.getContext("2d");
        this.initiateDropArea();
    }

    private runAnalyser(analyser: IAnalyserNode<IAudioContext>) {
        //return;
        //const analyser = this._audioContext.createAnalyser();
        //analyser.fftSize = 2048;
        var bufferLength = analyser.frequencyBinCount;
        //var dataArray = new Uint8Array(bufferLength);
        const sampleRate = 44100;
        const maxFreq = sampleRate / 2;
        const intArraySize = 2048;
        const floatArraySize = 1024;
        var dataArray = new Uint8Array(intArraySize);
        var dataArray2 = new Float32Array(floatArraySize);

        analyser.getByteTimeDomainData(dataArray);

        var canvasCtx = this.canvasContext;
        let stop: boolean = false;

        let searchFreq = 70;
        let freqStep = maxFreq / intArraySize;//22050/2048=10.8 - freq per element
        let index = Math.floor(searchFreq / freqStep);

        const draw = () => {
            if (!canvasCtx)
                return;
            if (stop) {
                canvasCtx.fillStyle = "cadetblue";
                canvasCtx.fillRect(0, 0, this.canvas?.nativeElement.width, this.canvas?.nativeElement.height);
                return;
            }
            requestAnimationFrame(draw);

            analyser.getByteFrequencyData(dataArray);

            // @ts-ignore
            //this.volume?.nativeElement.value.set(dataArray[index] / 128);

            analyser.getFloatFrequencyData(dataArray2);

            analyser.getByteTimeDomainData(dataArray);

            canvasCtx.fillStyle = "rgb(200, 200, 200)";
            canvasCtx.fillRect(0, 0, this.canvas?.nativeElement.width, this.canvas?.nativeElement.height);

            //region drawing
            canvasCtx.lineWidth = 2;
            canvasCtx.strokeStyle = "rgb(0, 0, 0)";

            canvasCtx.beginPath();

            var sliceWidth = this.canvas?.nativeElement.width * 1.0 / bufferLength;
            var x = 0;

            for (var i = 0; i < bufferLength; i++) {

                var v = dataArray[i] / 128.0;
                var y = v * this.canvas?.nativeElement.height / 2;

                if (i === 0) {
                    canvasCtx.moveTo(x, y);
                } else {
                    canvasCtx.lineTo(x, y);
                }

                x += sliceWidth;
            }

            canvasCtx.lineTo(this.canvas?.nativeElement.width, this.canvas?.nativeElement.height / 2);
            canvasCtx.stroke();
            //endregion
        }

        draw();
        setTimeout(() => {
            stop = true;
        }, 15000);
    }

    public async playSound(): Promise<void> {
        if (this._audioContext.state === 'suspended') {
            await this._audioContext.resume();
        }

        //const gain = this._audioContext.createGain();//
        const oscillatorNode = this._audioContext.createOscillator();
        oscillatorNode.connect(this.gainNode);//

        oscillatorNode.frequency.value = 70;
        //this.gainNode.gain.value = this.volume?.nativeElement.value;
        //gain.gain.setValueAtTime(1, this._audioContext.currentTime + 1);

        //oscillatorNode.start(0);
        this.gainNode.connect(this._audioContext.destination);
        //oscillatorNode.stop(this._audioContext.currentTime + 1);

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
        //this.voiceSource?.mediaElement.play();
    }

    startSound() {
        this.changeVolume(this.volume?.nativeElement.value);
        this.playSound();
    }

    changeVolume(volume: any) {
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

    initiateDropArea() {
        this.dropArea?.nativeElement.addEventListener('dragover', (event: DragEvent) => {
            event.stopPropagation();
            event.preventDefault();
            // Style the drag-and-drop as a "copy file" operation.
            if (event.dataTransfer) {
                event.dataTransfer.dropEffect = 'copy';
                // @ts-ignore
                this.dropArea?.nativeElement.style.backgroundColor = '#283e3d';
            }
        });

        this.dropArea?.nativeElement.addEventListener('drop', (event: DragEvent) => {
            event.stopPropagation();
            event.preventDefault();
            if (event.dataTransfer) {
                if (event.dataTransfer.files.length !== 1) {
                    return;
                }
                const file = event.dataTransfer.files[0];
                // @ts-ignore
                this.dropArea?.nativeElement.style.backgroundColor = '#304b49';
                file.arrayBuffer().then(buffer => {
                    console.log(buffer);

                    this._audioContext.decodeAudioData(buffer)
                        .then(decodedData => {
                            this.audioBuffer = decodedData;
                            const trackSource = this._audioContext.createBufferSource();
                            trackSource.buffer = decodedData;
                            const gain = this._audioContext.createGain();
                            trackSource.connect(gain);
                            const analyser = this._audioContext.createAnalyser();
                            gain.connect(analyser);
                            analyser.connect(this._audioContext.destination);
                            trackSource.start(0, 0, 15);
                            /*setTimeout(() => trackSource.stop(), 2000);*/

                            this.runAnalyser(analyser);
                        });
                });
            }
        });

        this.dropArea?.nativeElement.addEventListener('dragleave', (event: DragEvent) => {
            event.stopPropagation();
            event.preventDefault();
            if (event.dataTransfer) {
                const fileList = event.dataTransfer.files;
                // @ts-ignore
                this.dropArea?.nativeElement.style.backgroundColor = '#304b49';
            }
        });
    }

    dragEnd(event: CdkDragEnd) {
        console.log(event.source.getFreeDragPosition());
    }
}
