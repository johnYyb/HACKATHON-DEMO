
import { Component } from '@angular/core';

interface Dish {
  name: string;
  image: string;
}

interface MenuSection {
  title: string;
  dishes: Dish[];
}
@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.scss']
})
export class OrderComponent {
  menuSections: MenuSection[] = [
    {
      title: 'Recommended',
      dishes: [
        { name: 'Sushi', image: 'assets/sushi.jpeg' },
        { name: 'Steak', image: 'assets/steak.jpeg' },
        { name: 'Salad', image: 'assets/salad.jpeg' },
        { name: 'Pizza', image: 'assets/pizza.jpeg' }
      ]
    },
    {
      title: 'Main Course',
      dishes: [
        { name: 'Pasta', image: 'assets/pasta.jpeg' },
        { name: 'Burger', image: 'assets/burger.jpeg' },
        { name: 'Chicken', image: 'assets/chicken.jpeg' },
        { name: 'Fish', image: 'assets/fish.jpeg' }
      ]
    },
    {
      title: 'Alcohol',
      dishes: [
        { name: 'Beer', image: 'assets/beer.jpeg' },
        { name: 'Wine', image: 'assets/wine.jpeg' },
      ]
    }
  ];

  cart: { [dishName: string]: { dish: Dish, quantity: number } } = {};
  showCartModal = false;
  orderSuccess = false;

  addToCart(dish: Dish) {
    if (!this.cart[dish.name]) {
      this.cart[dish.name] = { dish, quantity: 1 };
    } else {
      this.cart[dish.name].quantity++;
    }
    this.orderSuccess = false;
  }

  openCart() {
    this.showCartModal = true;
    this.orderSuccess = false;
  }

  closeCart() {
    this.showCartModal = false;
  }

  placeOrder() {
    // Collect all items with name and quantity
    const orderList = this.cartItems.map(item => ({
      name: item.dish.name,
      quantity: item.quantity
    }));
    console.log('Order List:', orderList);
    this.orderSuccess = true;
    setTimeout(() => {
      this.showCartModal = false;
      this.orderSuccess = false;
    }, 1500);
  }

  get cartItems() {
    return Object.values(this.cart);
  }

  incrementItem(dishName: string) {
    if (this.cart[dishName]) {
      this.cart[dishName].quantity++;
    }
  }

  decrementItem(dishName: string) {
    if (this.cart[dishName] && this.cart[dishName].quantity > 1) {
      this.cart[dishName].quantity--;
    } else if (this.cart[dishName] && this.cart[dishName].quantity === 1) {
      delete this.cart[dishName];
    }
  }
}
