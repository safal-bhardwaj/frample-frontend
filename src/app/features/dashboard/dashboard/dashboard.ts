import { Component } from '@angular/core';
import { Navbar } from '../../../shared/components/navbar/navbar';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [Navbar],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard { }
