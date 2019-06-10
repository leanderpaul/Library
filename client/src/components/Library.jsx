import React from 'react';
import {
    MDBContainer,
    MDBRow,
    MDBCol,
    MDBCard,
    MDBCardBody,
    MDBModal,
    MDBModalBody,
    MDBModalHeader,
    MDBIcon,
    MDBModalFooter,
    MDBBtn,
    MDBInput,
    ToastContainer,
    toast
} from 'mdbreact';
import Axios from 'axios';

class Library extends React.Component {
    state = {
        books: [],
        modalData: {},
        loading: true,
        loaded: false,
        hoverAbove: null,
        modal: false,
        totalCount: null,
        isOpenFilter: false,
        filter: {
            searchAuthor: '',
            searchBookName: '',
            sortBy: 'bookName',
            minCount: '',
            maxCount: '',
            sortOrder: 1,
            skip: 0
        },
        filterChanged: false
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
            modalData: this.state.books[index]
        });
        this.toggleModal();
    };

    toggleFilter = () => {
        this.setState({
            ...this.state,
            isOpenFilter: !this.state.isOpenFilter
        });
    };

    handleQueryChange = e => {
        this.setState({
            ...this.state,
            filterChanged: true,
            filter: {
                ...this.state.filter,
                skip: 0,
                [e.target.name]: e.target.value
            }
        });
    };

    handleSelectChange = e => {
        let temp = document.getElementById(e);
        this.setState({
            ...this.state,
            filterChanged: true,
            filter: {
                ...this.state.filter,
                skip: 0,
                [e]: temp.options[temp.selectedIndex].value
            }
        });
    };

    handleNumberChange = e => {
        let temp = e.target.value;
        if (!isNaN(temp))
            this.setState({
                ...this.state,
                filterChanged: true,
                filter: {
                    ...this.state.filter,
                    skip: 0,
                    [e.target.name]: e.target.value
                }
            });
    };

    handleFilterBooks = () => {
        this.setState({ ...this.state, loading: true });
        Axios.post('/library', this.state.filter)
            .then(res => {
                let books = [];
                if (this.state.filterChanged) books = res.data.books;
                else books = this.state.books.concat(res.data.books);
                this.setState({
                    books: books,
                    loading: false,
                    loaded: true,
                    totalCount: res.data.count,
                    filterChanged: false,
                    filter: {
                        ...this.state.filter,
                        skip: books.length
                    }
                });
            })
            .catch(err => {
                console.log(err);
            });
    };

    loadBooks = () => {
        Axios.post('/library', this.state.filter).then(res => {
            this.setState({
                books: res.data.books,
                loading: false,
                loaded: true,
                totalCount: res.data.count,
                filter: {
                    ...this.state.filter,
                    skip: 100
                }
            });
        });
    };

    handleFilter = async () => {
        await this.setState({
            ...this.state,
            books: []
        });
        this.handleFilterBooks();
        this.toggleFilter();
    };

    handleHover = hoveringOn => {
        this.setState({
            ...this.state,
            hoverAbove: hoveringOn
        });
    };

    deleteBook = bookIndex => {
        this.setState({ ...this.state, modal: false });
        Axios.post('/deleteBook', this.state.books[bookIndex])
            .then(res => {
                if (res.data.success) {
                    toast.success('Book deleted successfully !');
                    let books = this.state.books.filter((book, index) => index != bookIndex);
                    this.setState({
                        ...this.state,
                        books
                    });
                }
            })
            .catch(err => {
                console.log(err);
            });
    };

    render() {
        const { modalData, books, loading, loaded, totalCount } = this.state;
        if (loaded === false) this.loadBooks();
        let modalList = Object.keys(modalData).map(objectKey => <div className='book-detail'>{objectKey + ': ' + modalData[objectKey]}</div>);
        let resultList;
        if (books && Array.isArray(books))
            resultList = books.map((result, index) => (
                <MDBCol size='6' className='my-2' key={index}>
                    <MDBCard
                        onClick={() => this.viewDetails(index)}
                        onMouseEnter={() => this.handleHover(index)}
                        onMouseLeave={() => this.handleHover(null)}
                    >
                        <MDBCardBody>
                            <div className='h5'>{result.bookName}</div>
                            <div className='text-right font-italic font-weight-light'>{result.author}</div>
                        </MDBCardBody>
                    </MDBCard>
                    {this.state.hoverAbove == index && (
                        <MDBIcon
                            className='delete-icon pointer'
                            size='lg'
                            icon='trash-alt'
                            onClick={() => this.deleteBook(index)}
                            onMouseEnter={() => this.handleHover(index)}
                            onMouseLeave={() => this.handleHover(null)}
                        />
                    )}
                </MDBCol>
            ));
        return (
            <MDBContainer className='p-3 mt-5'>
                <ToastContainer position={'top-center'} hideProgressBar={true} />
                <MDBRow className='pt-5 pl-3'>
                    <div className='h1 purple-text text-uppercase heading'>Library</div>
                    <div className='ml-auto'>
                        <MDBIcon icon='filter' size='2x' className='pointer' onClick={this.toggleFilter} />
                    </div>
                </MDBRow>
                {loading && books.length === 0 && (
                    <div className='text-center mt-5'>
                        <div className='text-center spinner'>
                            <div className='spinner-border purple-text' role='status'>
                                <span className='sr-only'>Loading...</span>
                            </div>
                        </div>
                        <br />
                        <br />
                        <br />
                        <div className='h3'>Loading Books. Please wait</div>
                    </div>
                )}
                {books.length > 0 && (
                    <div>
                        <MDBRow className='my-5 pl-3'>
                            <div className='h5'>{totalCount} books present in the library</div>
                        </MDBRow>
                        <MDBRow className='my-5'>{resultList}</MDBRow>
                    </div>
                )}
                {books.length > 0 && loading === false && totalCount > books.length && (
                    <MDBRow>
                        <MDBCol className='text-center'>
                            <MDBBtn className='search-btn' onClick={this.handleFilterBooks}>
                                Load More
                            </MDBBtn>
                        </MDBCol>
                    </MDBRow>
                )}
                {books.length > 0 && loading && (
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
                <MDBModal isOpen={this.state.isOpenFilter} toggle={this.toggleFilter} size='lg' centered>
                    <MDBModalHeader toggle={this.toggleFilter}>Find Books</MDBModalHeader>
                    <MDBModalBody className='p-5'>
                        <MDBRow className='search-section pb-3'>
                            <MDBCol size='12'>
                                <h3 className='font-weight-bolder'>Search</h3>
                            </MDBCol>
                            <MDBCol size='12'>
                                <MDBInput
                                    label='Search by book name'
                                    icon='search'
                                    value={this.state.filter.searchBookName}
                                    name='searchBookName'
                                    onChange={this.handleQueryChange}
                                />
                            </MDBCol>
                            <MDBCol size='12'>
                                <MDBInput
                                    label='Search by author'
                                    icon='search'
                                    value={this.state.filter.searchAuthor}
                                    name='searchAuthor'
                                    onChange={this.handleQueryChange}
                                />
                            </MDBCol>
                        </MDBRow>
                        <MDBRow className='mt-3'>
                            <MDBCol size='12'>
                                <h3 className='font-weight-bolder'>Count</h3>
                            </MDBCol>
                            <MDBCol size='6'>
                                <MDBInput
                                    type='text'
                                    label='Minimum Count'
                                    name='minCount'
                                    value={this.state.filter.minCount}
                                    onChange={this.handleNumberChange}
                                />
                            </MDBCol>
                            <MDBCol size='6'>
                                <MDBInput
                                    type='text'
                                    label='Maximum Count'
                                    name='maxCount'
                                    value={this.state.filter.maxCount}
                                    onChange={this.handleNumberChange}
                                />
                            </MDBCol>
                        </MDBRow>
                        <MDBRow>
                            <MDBCol size='12'>
                                <h3 className='font-weight-bolder'>Sort By</h3>
                            </MDBCol>
                            <MDBCol size='6'>
                                <select
                                    onChange={() => this.handleSelectChange('sortBy')}
                                    id='sortBy'
                                    className='w-100'
                                    value={this.state.filter.sortBy}
                                >
                                    <option value='book.bookName'>Book Name</option>
                                    <option value='book.author'>Author</option>
                                    <option value='count'>Count</option>
                                </select>
                            </MDBCol>
                            <MDBCol size='6'>
                                <select
                                    onChange={() => this.handleSelectChange('sortOrder')}
                                    id='sortOrder'
                                    className='w-100'
                                    value={this.state.filter.sortOrder}
                                >
                                    <option value='1'>Ascending</option>
                                    <option value='-1'>Descending</option>
                                </select>
                            </MDBCol>
                        </MDBRow>
                    </MDBModalBody>
                    <MDBModalFooter>
                        <MDBBtn onClick={this.handleFilter}>Filter Books</MDBBtn>
                    </MDBModalFooter>
                </MDBModal>
            </MDBContainer>
        );
    }
}

export default Library;
