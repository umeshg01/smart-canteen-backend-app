
import { useState } from 'react';
import './App.css';


const foods = [
  { id: 1, name: 'Veg Burger', price: 50, emoji: '🍔', category: 'Snacks' },
  { id: 2, name: 'Pizza', price: 100, emoji: '🍕', category: 'Snacks' },
  { id: 3, name: 'Veg Sandwich', price: 40, emoji: '🥪', category: 'Snacks' },
  { id: 4, name: 'Masala Dosa', price: 60, emoji: '🥞', category: 'Breakfast' },
  { id: 5, name: 'Fried Rice', price: 80, emoji: '🍚', category: 'Lunch' },
  { id: 6, name: 'Cold Coffee', price: 35, emoji: '🥤', category: 'Drinks' },

  // New food items
  { id: 7, name: 'Chicken Biryani', price: 120, emoji: '🍛', category: 'Lunch' },
  { id: 8, name: 'Samosa', price: 20, emoji: '🥟', category: 'Snacks' },
  { id: 9, name: 'French Fries', price: 60, emoji: '🍟', category: 'Snacks' },
  { id: 10, name: 'Tea', price: 15, emoji: '☕', category: 'Drinks' },
];


const categories = ['All', 'Snacks', 'Breakfast', 'Lunch', 'Drinks'];

function App() {
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [studentName, setStudentName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [payment, setPayment] = useState('Cash at Pickup');
  const [confirmation, setConfirmation] = useState(null);

  const filteredFoods = foods.filter((food) => {
    const matchesSearch = food.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'All' || food.category === category;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (food) => {
    setConfirmation(null);
    setCart((current) => {
      const existing = current.find((item) => item.id === food.id);

      if (existing) {
        return current.map((item) =>
          item.id === food.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...current, { ...food, quantity: 1 }];
    });
  };

  const changeQuantity = (id, amount) => {
    setConfirmation(null);
    setCart((current) =>
      current
        .map((item) =>
          item.id === id
            ? { ...item, quantity: item.quantity + amount }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (id) => {
    setConfirmation(null);
    setCart((current) => current.filter((item) => item.id !== id));
  };

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);


const placeOrder = async (event) => {
  event.preventDefault();

  if (cart.length === 0) {
    alert('Please add food to your cart first.');
    return;
  }

  try {
    const responses = await Promise.all(
      cart.map((item) =>
        fetch('http://localhost:8080/api/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            customerName: studentName.trim(),
            foodName: item.name,
            quantity: item.quantity,
            totalPrice: item.price * item.quantity,
          }),
        })
      )
    );

    if (responses.some((response) => !response.ok)) {
      throw new Error('The backend could not save the order.');
    }

    const token = `SC${Date.now().toString().slice(-6)}`;

    setConfirmation({
      token,
      name: studentName.trim(),
      studentId: studentId.trim(),
      payment,
      items: cart.map((item) => ({ ...item })),
      total,
      date: new Date().toLocaleString(),
    });

    setCart([]);
    setStudentName('');
    setStudentId('');

    document.getElementById('confirmation')?.scrollIntoView({
      behavior: 'smooth',
    });
  } catch (error) {
    console.error('Order submission failed:', error);
    alert('Order could not be saved. Check that the backend is running.');
  }
};


  return (
    <div className="app">
      <header className="navbar">
        <a className="brand" href="#home">🍽️ Smart Canteen</a>
        <nav>
          <a href="#menu">Food Menu</a>
          <a href="#cart">My Cart ({totalItems})</a>
        </nav>
      </header>

      <section className="hero" id="home">
        <p className="tagline">WELCOME TO OUR COLLEGE CANTEEN</p>
        <h1>Good Food, Less Waiting!</h1>
        <p>Choose your favourite food and order it online.</p>
        <a className="primary-btn" href="#menu">Explore Menu</a>
      </section>

      <main>
        <section id="menu" className="menu-section">
          <h2>Our Food Menu</h2>
          <p className="subtitle">
            Fresh food at student-friendly prices
          </p>

          <div className="food-filters">
            <input
              type="search"
              placeholder="Search food, e.g. Pizza..."
              aria-label="Search food"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />

            <select
              aria-label="Filter by category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item === 'All' ? 'All Categories' : item}
                </option>
              ))}
            </select>
          </div>

          <div className="food-grid">
            {filteredFoods.map((food) => (
              <article className="food-card" key={food.id}>
                <div className="food-emoji">{food.emoji}</div>
                <p className="category">{food.category}</p>
                <h3>{food.name}</h3>
                <p className="price">₹{food.price}</p>
                <button
                  type="button"
                  onClick={() => addToCart(food)}
                >
                  + Add to Cart
                </button>
              </article>
            ))}
          </div>

          {filteredFoods.length === 0 && (
            <p className="empty-message">
              No food items found. Try another search.
            </p>
          )}
        </section>

        <section id="cart" className="cart-section">
          <h2>🛒 My Cart</h2>

          {cart.length === 0 ? (
            <p className="empty-message">
              Your cart is empty. Add some delicious food!
            </p>
          ) : (
            <>
              <div className="cart-list">
                {cart.map((item) => (
                  <div className="cart-item" key={item.id}>
                    <div className="cart-food">
                      <span className="cart-emoji">{item.emoji}</span>
                      <div>
                        <strong>{item.name}</strong>
                        <p>₹{item.price} each</p>
                      </div>
                    </div>

                    <div className="quantity-controls">
                      <button
                        type="button"
                        className="quantity-btn"
                        aria-label={`Decrease ${item.name}`}
                        onClick={() => changeQuantity(item.id, -1)}
                      >
                        −
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        type="button"
                        className="quantity-btn"
                        aria-label={`Increase ${item.name}`}
                        onClick={() => changeQuantity(item.id, 1)}
                      >
                        +
                      </button>
                    </div>

                    <strong className="item-total">
                      ₹{item.price * item.quantity}
                    </strong>

                    <button
                      type="button"
                      className="remove-btn"
                      onClick={() => removeFromCart(item.id)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              <h3 className="cart-total">
                Total: ₹{total}
              </h3>

              <form className="checkout-form" onSubmit={placeOrder}>
                <h3>Student Details</h3>

                <label htmlFor="studentName">Student name</label>
                <input
                  id="studentName"
                  type="text"
                  placeholder="Enter your full name"
                  value={studentName}
                  onChange={(event) => setStudentName(event.target.value)}
                  required
                  maxLength={80}
                />

                <label htmlFor="studentId">College student ID</label>
                <input
                  id="studentId"
                  type="text"
                  placeholder="Enter your student ID"
                  value={studentId}
                  onChange={(event) => setStudentId(event.target.value)}
                  required
                  maxLength={40}
                />

                <h3>Payment Option</h3>

                <label className="payment-option">
                  <input
                    type="radio"
                    name="payment"
                    value="Cash at Pickup"
                    checked={payment === 'Cash at Pickup'}
                    onChange={(event) => setPayment(event.target.value)}
                  />
                  Cash at Pickup
                </label>

                <label className="payment-option">
                  <input
                    type="radio"
                    name="payment"
                    value="Online Payment (Demo)"
                    checked={payment === 'Online Payment (Demo)'}
                    onChange={(event) => setPayment(event.target.value)}
                  />
                  Online Payment (Demo)
                </label>

                {payment === 'Online Payment (Demo)' && (
                  <p className="demo-notice">
                    Demo only: no money will be charged. Real online
                    payment will require a payment gateway.
                  </p>
                )}

                <button className="place-order-btn" type="submit">
                  Confirm Order — ₹{total}
                </button>
              </form>
            </>
          )}
        </section>

        {confirmation && (
          <section id="confirmation" className="confirmation-card">
            <div className="success-icon">✓</div>
            <h2>Order Confirmed!</h2>
            <p>Thank you, {confirmation.name}.</p>

            <div className="token-box">
              <p>Your demo order token</p>
              <strong>{confirmation.token}</strong>
            </div>

            <p><strong>Student ID:</strong> {confirmation.studentId}</p>
            <p><strong>Payment:</strong> {confirmation.payment}</p>
            <p><strong>Order time:</strong> {confirmation.date}</p>

            <h3>Order Summary</h3>
            {confirmation.items.map((item) => (
              <p key={item.id}>
                {item.emoji} {item.name} × {item.quantity} — ₹
                {item.price * item.quantity}
              </p>
            ))}

            <h3>Total Paid / Due: ₹{confirmation.total}</h3>
            <p className="demo-notice">
              This is a frontend demonstration. Your order token has not
              yet been saved to the database or sent to the kitchen.
            </p>

            <button
              type="button"
              className="place-order-btn"
              onClick={() => {
                setConfirmation(null);
                window.location.hash = 'menu';
              }}
            >
              Order More Food
            </button>
          </section>
        )}
      </main>

      <footer>
        <p>Smart Canteen System | College Food Ordering</p>
      </footer>
    </div>
  );
}

export default App;
