import React from 'react';
import { MDBContainer, MDBRow, MDBCol, MDBView, MDBMask, MDBIcon } from 'mdbreact';
import Axios from 'axios';
import socketClient from 'socket.io-client';
import date from 'date-and-time';

class Home extends React.Component {
    state = {
        uploading: false,
        processId: null,
        logs: []
    };

    handleUploadFile = e => {
        this.setState({ uploading: true });
        let formData = new FormData();
        formData.append('file', e.target.files[0]);
        Axios.post('/', formData)
            .then(res => {
                console.log(res.data);
                this.setState({
                    uploading: false,
                    processId: res.data.id
                });
                this.handleLogging();
            })
            .catch(err => {
                console.log(err);
            });
    };

    handleLogging = () => {
        const io = socketClient('/');
        const scroll = document.getElementById('scroll');
        io.emit('processFile', this.state.processId);
        io.on('log', data => {
            let convertedData = String.fromCharCode.apply(null, new Uint8Array(data)).split('\n');
            let logs = this.state.logs;
            let time = new Date();
            for (let index = 0; index < convertedData.length - 1; index++) {
                logs.push(<div key={logs.length + 1}>{'[ ' + date.format(time, 'DD MMM Y HH:mm:ss:SSS') + ' ] : ' + convertedData[index]}</div>);
            }
            this.setState({
                ...this.state,
                logs
            });
            scroll.scrollTop = scroll.scrollHeight - scroll.clientHeight;
        });
        io.on('logEnd', data => {
            let logs = this.state.logs;
            let time = new Date();
            logs.push(<div>{'[ ' + date.format(time, 'DD MMM Y HH:mm:ss:SSS') + ' ] : Completed processing Data'}</div>);
            this.setState({
                ...this.state,
                logs
            });
        });
    };

    render() {
        if (this.state.logs.length > 12000) {
            console.log('split');
            this.setState({ ...this.state, logs: this.state.logs.slice(1000) });
        }
        return (
            <div>
                <MDBView>
                    <img src={require('../resources/landingImage1.jpg')} alt='Landing' width='100%' className='landingImage' />
                    <MDBMask overlay='black-strong' className='flex-center'>
                        <h1 className='white-text h1 heading text-uppercase'>Library &nbsp; Management &nbsp; System</h1>
                    </MDBMask>
                </MDBView>
                <MDBContainer>
                    <MDBRow className='my-5'>
                        <MDBCol size='12' className='px-0'>
                            <div className='mb-5 text-center'>
                                <span className='h1 text-uppercase purple-text'>Control Panel</span>
                            </div>
                            {this.state.uploading === false && (
                                <div className='mb-5'>
                                    <input id='cover' type='file' onChange={this.handleUploadFile} hidden={true} />
                                    <label htmlFor='cover' className='cover w-100 text-center'>
                                        <div className='cover-upload h-100'>
                                            <br />
                                            <br />
                                            <br />
                                            <br />
                                            <MDBIcon icon='upload' className='upload-icon' />
                                            <br />
                                            <br />
                                            <span className='upload-text'>Click to upload File</span>
                                        </div>
                                    </label>
                                </div>
                            )}
                            {this.state.uploading && (
                                <div className='mb-5 text-center'>
                                    <div className='spinner-border text-success' role='status'>
                                        <span className='sr-only'>Loading...</span>
                                    </div>
                                </div>
                            )}
                            <div className='logs mt-4 p-3' id='scroll'>
                                {this.state.logs}
                            </div>
                        </MDBCol>
                    </MDBRow>
                </MDBContainer>
            </div>
        );
    }
}

export default Home;
