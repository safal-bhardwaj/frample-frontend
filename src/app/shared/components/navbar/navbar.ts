import { Component, signal, inject, HostListener, ElementRef } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar {
  private authService = inject(AuthService);
  private router = inject(Router);
  private elementRef = inject(ElementRef);

  isDropdownOpen = signal(false);
  currentUser = this.authService.currentUser;

  toggleDropdown(): void {
    this.isDropdownOpen.set(!this.isDropdownOpen());
  }

  // Closes the dropdown when clicking anywhere outside the navbar
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isDropdownOpen.set(false);
    }
  }

  onEditProfile(): void {
    this.isDropdownOpen.set(false);
    // TODO: wire up once the profile edit page exists
  }

  onLogout(): void {
    this.isDropdownOpen.set(false);
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}