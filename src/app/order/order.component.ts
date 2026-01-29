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
        { name: 'Sushi', image: 'assets/sushi.jpg' },
        { name: 'Steak', image: 'assets/steak.jpg' },
        { name: 'Salad', image: 'assets/salad.jpg' },
        { name: 'Pizza', image: 'assets/pizza.jpg' }
      ]
    },
    {
      title: 'Main Course',
      dishes: [
        { name: 'Pasta', image: 'assets/pasta.jpg' },
        { name: 'Burger', image: 'assets/burger.jpg' },
        { name: 'Chicken', image: 'assets/chicken.jpg' },
        { name: 'Fish', image: 'assets/fish.jpg' }
      ]
    },
    {
      title: 'Alcohol',
      dishes: [
        { name: 'Beer', image: 'assets/beer.jpg' },
        { name: 'Wine', image: 'assets/wine.jpg' },
        { name: 'Whiskey', image: 'assets/whiskey.jpg' },
        { name: 'Cocktail', image: 'assets/cocktail.jpg' }
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
    this.orderSuccess = true;
    this.cart = {};
    setTimeout(() => {
      this.showCartModal = false;
      this.orderSuccess = false;
    }, 1500);
  }

  get cartItems() {
    return Object.values(this.cart);
  }
}
