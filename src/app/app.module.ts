
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { OrderComponent } from './order/order.component';
import { PayComponent } from './pay/pay.component';
import { OtherComponent } from './other/other.component';
import { DiningTablesComponent } from './dining-tables/dining-tables.component';
import { NavigatorComponent } from './navigator/navigator.component';
import { ModernMenuComponent } from './modern-menu/modern-menu.component';

@NgModule({
  declarations: [
    AppComponent,
    OrderComponent,
    PayComponent,
    OtherComponent,
    DiningTablesComponent,
    NavigatorComponent,
    ModernMenuComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
