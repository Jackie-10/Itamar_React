import React, { useEffect, useReducer } from 'react'
// import { Link } from 'react-router-dom';
import axios from 'axios';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Product from '../components/Product';
import { Helmet } from 'react-helmet-async';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';

const reducer = (state, action) => {

  switch (action.type) {

    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return { ...state, products: action.payload, loading: false };
    case 'FETCH_FAIL':
      return { ...state, error: action.payload, loading: false };
    default:
      return state;

  }
}

const HomeScreen = () => {

  const [{ loading, error, products }, dispatch] = useReducer(reducer, {
    products: [],
    loading: true,
    error: ''
  });
  //אנחנו יוצרים פונקציה א-סינכורנית בשם fetchData 
  // const [products, setProsucts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      dispatch({ type: 'FETCH_REQUEST' })
      try {
        const result = await axios.get('/api/products');
        dispatch({ type: 'FETCH_SUCCESS', payload: result.data })
      }
      catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: err.message });
      }
      //בגוף הפונקציה אנחנו יוצרים משתנה בשם result  אשר מחזיק בבקשת get של axois למוצרים
      // const result = await axios.get('/api/products');

      //         נעדכן את products על ידי קריאה לsetProducts והפרמטר המתקבל בפונקציה יהיה הנתונים (data).
      // (הנתונים בdata חוזרים מהבקשה המוחזקת במשתנה result. אז אנחנו ניגשים למידע החוזר דרך result.data)
      // setProsucts(result.data);
    }
    fetchData();
  }, []);


  return (
    <div>
      <Helmet>
        <title>ITAMAR STORE</title>
      </Helmet>
      <h1>Featured Products</h1>
      <div className="products">
        <Row>
          {loading ? (
            <LoadingBox/>
          ) : error ? (
            <MessageBox variant='danger'>{error}</MessageBox>
          ) : (
            products.map(product => (
              <Col key={product.slug} sm={6} md={4} lg={3} className="mb-3">
                <Product product={product}></Product>
              </Col>
            )))}
        </Row>
      </div>
    </div>
  )
}

export default HomeScreen;

