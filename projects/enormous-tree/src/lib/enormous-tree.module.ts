import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { EnormousTreeComponent } from './enormous-tree.component';



@NgModule({
   imports: [
      CommonModule,
      ScrollingModule
   ],
   declarations: [
      EnormousTreeComponent
   ],
   exports: [
      EnormousTreeComponent
   ]
})
export class EnormousTreeModule { }
