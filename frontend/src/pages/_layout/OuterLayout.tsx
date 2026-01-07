import React from 'react';
import { Outlet } from 'react-router-dom';
import NavBarOuter from '@/components/NavBarOuter';

const OuterLayout: React.FC = () => {
  return (
    <div>
      {/* Outer layout - for public pages like landing page */}
      <header>
        
        {/* Add navigation, logo, etc. for public pages */}
        <nav>
          <NavBarOuter />
        </nav>
      </header>
      
      <main>
        <div>
        </div>
        <Outlet /> {/* This is where the child route will be rendered */}
      </main>
      
      <footer>
        {/* Footer for public pages */}
      </footer>
    </div>
  );
};

export default OuterLayout;
