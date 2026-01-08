// components/ErrorBoundary.jsx
import { useRouteError, Link } from 'react-router-dom';
import './styles.scss';

export function ErrorBoundary() {
  const error = useRouteError();
  
  return (
    <div className="error-container">
      <h1>Oops!</h1>
      <p>Sorry, an unexpected error has occurred.</p>
      <p>
        <i>{error.statusText || error.message}</i>
      </p>
      <Link to="/">Go back to Home</Link>
    </div>
  );
}