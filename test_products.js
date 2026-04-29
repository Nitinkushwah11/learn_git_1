
import axios from 'axios';

async function testProducts() {
    try {
        const response = await axios.get('http://localhost:8080/products');
        console.log('Products found:', response.data.length);
        console.log('First product:', response.data[0]);
    } catch (err) {
        console.error('Error fetching products:', err.message);
    }
}

testProducts();
