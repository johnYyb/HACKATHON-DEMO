import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModernMenuComponent } from './modern-menu.component';

@NgModule({
  declarations: [ModernMenuComponent],
  imports: [CommonModule, FormsModule],
  exports: [ModernMenuComponent]
})
export class ModernMenuModule {}
