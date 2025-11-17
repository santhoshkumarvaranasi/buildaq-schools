import { Component, signal, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  protected readonly title = signal('buildaq-schools');

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    // Check for auth token from shell app
    const urlParams = new URLSearchParams(window.location.search);
    const authToken = urlParams.get('authToken');
    
    if (authToken) {
      // Store the auth token for API calls
      localStorage.setItem('shellAuthToken', authToken);
      
      // Notify parent frame (shell) that we're ready
      if (window.parent !== window) {
        window.parent.postMessage({ type: 'schools-ready', token: authToken }, '*');
      }
      
      // Remove token from URL for security
      const url = new URL(window.location.href);
      url.searchParams.delete('authToken');
      window.history.replaceState({}, '', url.pathname + url.hash);
    }
  }
}
