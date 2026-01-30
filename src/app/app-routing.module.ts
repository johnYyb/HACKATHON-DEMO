import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// import { OrderComponent } from './order/order.component';
import { PayComponent } from './pay/pay.component';
import { OtherComponent } from './other/other.component';
import { ModernMenuComponent } from './modern-menu/modern-menu.component';
import { SeatingComponent } from './seating/seating.component';

const routes: Routes = [
  { path: 'order', component: ModernMenuComponent },
  { path: 'pay', component: PayComponent },
  { path: 'other', component: OtherComponent },
  { path: 'seating', component: SeatingComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
