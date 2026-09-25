import { Component } from '@angular/core';
import { Navbar } from '../../../shared/components/navbar/navbar';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [Navbar],
  templateUrl: './upload.html',
  styleUrl: './upload.css'
})
export class Upload { }