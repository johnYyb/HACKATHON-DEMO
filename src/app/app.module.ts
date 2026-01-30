
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { OrderComponent } from './order/order.component';
import { PayComponent } from './pay/pay.component';
import { OtherComponent } from './other/other.component';
import { SeatingComponent } from './seating/seating.component';
import { DiningTablesComponent } from './dining-tables/dining-tables.component';
import { NavigatorComponent } from './navigator/navigator.component';

@NgModule({
  declarations: [
    AppComponent,
    OrderComponent,
    PayComponent,
    OtherComponent,
    SeatingComponent,
    DiningTablesComponent,
    NavigatorComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
