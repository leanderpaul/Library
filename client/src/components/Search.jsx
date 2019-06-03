import React from 'react';
import { MDBContainer, MDBInput, MDBBtn, MDBRow, MDBCol, MDBCard, MDBCardBody, MDBModal, MDBModalBody, MDBModalHeader } from 'mdbreact';
import Axios from 'axios';

class Search extends React.Component {
    state = {
        searchQuery: '',
        searchBy: 'bookName',
        loading: false,
        modal: false,
        modalData: {},
        searchResult: [],
        noOfCols: 1
    };

    handleChange = e => {
        this.setState({ searchQuery: e.target.value });
    };

    handleSearch = e => {
        this.setState({ ...this.state, loading: true });
        let postData = {
            search: this.state.searchQuery,
            skip: this.state.searchResult.length,
            searchBy: this.state.searchBy
        };
        Axios.post('/search', postData)
            .then(res => {
                let searchResult = this.state.searchResult;
                this.setState({ ...this.state, loading: false, searchResult: searchResult.concat(res.data.searchResult) });
            })
            .catch(err => {
                console.log(err);
            });
    };

    handleSubmit = async e => {
        e.preventDefault();
        await this.setState({
            ...this.state,
            searchResult: []
        });
        this.handleSearch();
    };

    toggleModal = () => {
        this.setState({
            ...this.state,
            modal: !this.state.modal
        });
    };

    viewDetails = async index => {
        await this.setState({
            ...this.state,
            modalData: this.state.searchResult[index]
        });
        this.toggleModal();
    };

    changeNumberOfColumns = () => {
        let temp = document.getElementById('col');
        this.setState({
            ...this.state,
            noOfCols: temp.options[temp.selectedIndex].value
        });
    };

    changeSearchBy = async () => {
        let temp = document.getElementById('searchBy');
        await this.setState({
            ...this.state,
            searchResult: [],
            searchBy: temp.options[temp.selectedIndex].value
        });
    };

    render() {
        const { loading, modalData, searchResult, noOfCols } = this.state;
        let modalList = Object.keys(modalData).map(objectKey => <div className='book-detail'>{objectKey + ': ' + modalData[objectKey]}</div>);
        let resultList = searchResult.map((result, index) => (
            <MDBCol size={(12 / noOfCols).toString()} className='my-2' key={index}>
                <MDBCard onClick={() => this.viewDetails(index)}>
                    <MDBCardBody>
                        <div className='h5'>{result.bookName}</div>
                        <div className='text-right font-italic font-weight-light'>{result.author}</div>
                    </MDBCardBody>
                </MDBCard>
            </MDBCol>
        ));
        return (
            <MDBContainer className='p-3'>
                <form onSubmit={this.handleSubmit} className='mt-5 pt-3'>
                    <MDBRow>
                        <MDBCol size='9'>
                            <MDBInput label='Search' icon='search' value={this.state.searchQuery} onChange={this.handleChange} />
                        </MDBCol>
                        <MDBCol size='3'>
                            <div className='text-center w-100'>
                                {loading && (
                                    <MDBBtn type='submit' className='search-btn' disabled>
                                        <div className='text-center spinner'>
                                            <div className='spinner-border white-text' role='status'>
                                                <span className='sr-only'>Loading...</span>
                                            </div>
                                        </div>
                                    </MDBBtn>
                                )}
                                {loading === false && (
                                    <MDBBtn type='submit' gradient='purple' className='search-btn'>
                                        <span className='search-text white-text'>Search</span>
                                    </MDBBtn>
                                )}
                            </div>
                        </MDBCol>
                    </MDBRow>
                </form>
                <MDBRow>
                    <MDBCol size='6' className='text-center'>
                        <select onChange={this.changeNumberOfColumns} id='col'>
                            <option value='1'>1 Column per row</option>
                            <option value='2'>2 Columns per row</option>
                            <option value='3'>3 Columns per row</option>
                        </select>
                    </MDBCol>
                    <MDBCol size='6' className='text-center'>
                        <select onChange={this.changeSearchBy} id='searchBy'>
                            <option value='bookName'>Search by Book Name</option>
                            <option value='author'>Search by Author</option>
                        </select>
                    </MDBCol>
                </MDBRow>
                <MDBRow className='my-5'>{resultList}</MDBRow>
                {searchResult.length > 0 && loading === false && (
                    <MDBRow>
                        <MDBCol className='text-center'>
                            <MDBBtn className='search-btn' onClick={this.handleSearch}>
                                Load More
                            </MDBBtn>
                        </MDBCol>
                    </MDBRow>
                )}
                {searchResult.length > 0 && loading && (
                    <MDBRow>
                        <MDBCol className='text-center'>
                            <MDBBtn className='search-btn'>
                                <div className='text-center spinner'>
                                    <div className='spinner-border white-text' role='status'>
                                        <span className='sr-only'>Loading...</span>
                                    </div>
                                </div>
                            </MDBBtn>
                        </MDBCol>
                    </MDBRow>
                )}
                <MDBModal isOpen={this.state.modal} toggle={this.toggleModal} centered>
                    <MDBModalHeader toggle={this.toggleModal}>Book Details</MDBModalHeader>
                    <MDBModalBody>{modalList}</MDBModalBody>
                </MDBModal>
            </MDBContainer>
        );
    }
}

export default Search;
