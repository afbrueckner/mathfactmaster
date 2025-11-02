# Math Fact Fluency - Strategy Practice App

## Overview

This is a streamlined math fact fluency practice application inspired by the Bay-Williams & Kling framework. **This is not an official product of Bay-Williams & Kling** - it draws inspiration from their research to help students build math fact fluency through sustained practice with derived strategies.

The app focuses on students who struggle with memorization by providing meaningful practice with derived fact strategies through engaging games. It tracks student progress with emphasis on accuracy over time, strategy usage, and practice frequency.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **Styling**: Tailwind CSS with shadcn/ui component library for consistent design
- **State Management**: TanStack Query for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Component Structure**: Modular component architecture with reusable UI components organized under `/components/ui/`

### Backend Architecture (Updated August 2025)
- **Development**: Node.js with Express.js for development environment only
- **Production**: Static hosting - no backend required for production deployment
- **API Simulation**: Mock API layer using localStorage for all data operations
- **Development Setup**: TSX for development server with hot reloading
- **Build Process**: `build-static.js` creates deployable static files for free hosting platforms

### Data Storage Solutions (Updated November 2025)
- **Client-Side Storage**: localStorage for browser-based data persistence without hosting costs
- **Mock API Layer**: `mockApi.ts` simulates server endpoints using localStorage for data operations
- **Static Hosting Compatible**: No database required - works on GitHub Pages, Netlify, Vercel
- **Schema Design**: Maintained comprehensive TypeScript schema for type safety across localStorage operations
- **Data Persistence**: Student progress and practice data stored locally in user's browser
- **Removed Features**: Avatar customization and reward systems removed to focus on strategy practice

### Authentication and Authorization (Updated August 2025)
- **No Authentication Required**: Simplified for educational demonstration purposes
- **Student Context**: Application operates with a default student context stored in localStorage
- **Data Privacy**: All data remains local to user's browser with no server transmission

### External Dependencies (Updated August 2025)
- **No External Services**: Eliminated database dependency for zero hosting costs
- **UI Components**: Radix UI primitives for accessible component foundations
- **Styling**: Tailwind CSS with custom design tokens for the Bay-Williams framework
- **Development Tools**: Replit-specific plugins for development environment integration
- **Form Handling**: React Hook Form with Zod validation for type-safe form management
- **Date Utilities**: date-fns for date manipulation and formatting
- **Static Hosting Ready**: Compatible with GitHub Pages, Netlify, Vercel for free deployment

### Key Design Patterns
- **Shared Schema**: Common TypeScript types and Zod schemas shared between client and server
- **Component Composition**: Extensive use of composition patterns with Radix UI primitives
- **Type Safety**: Full TypeScript coverage with strict type checking
- **Educational Framework**: Application structure mirrors the Bay-Williams & Kling research framework for math fact fluency
- **Progressive Enhancement**: Responsive design with mobile-first approach
- **Comprehensive Self-Assessment**: Eight distinct assessment types covering all major fact categories with drag-and-drop sorting interface

### App Simplification (November 2025)
- **Streamlined Navigation**: Reduced to 3 core student pages - Dashboard, Strategy Games, My Progress
- **Removed Features for Focus**: 
  - Self-assessment tools (removed)
  - Reward system and points (removed)
  - Avatar customization (removed)
  - Foundational facts practice section (removed)
  - Quick Looks tool (removed)
- **Strategy-Focused Games**: All 7 games now display which strategies they practice and which foundational facts are needed
- **Enhanced Game Metadata**: Each game card shows "Strategies Practiced" (e.g., Make 10, Doubles, Near Doubles) and "Foundational Facts Needed" (e.g., Addition Facts to 10, Combinations to 10)
- **Progress Tracking Simplified**: Focus on three key metrics in order of priority:
  1. Accuracy over time
  2. Strategies being used/practiced
  3. Number of practice sessions
- **Teacher Dashboard Retained**: Admin panel still available at `/admin` for teachers to monitor student progress
- **Learning Path Kept**: Personalized recommendations focused on which strategies need more practice
- **Clear Attribution**: Dashboard and games pages clarify this is inspired by Bay-Williams framework, not an official product

### Previous Enhancements (August 2025)
- **Comprehensive Assessment System**: Renamed from "Self Assessment" to "Assessment" to reflect full scope including teacher observations, phase assessments, strategy interviews, and student self-assessments
- **Data Consistency Improvements**: Implemented standardized dropdown lists for fact areas (Addition Facts to 5/10/20, Doubles Facts, 2s/5s/10s Multiplication, etc.) and learning phases (Counting/Deriving/Mastery) to ensure consistent data collection over time
- **Streamlined Observation Tools**: Removed redundant observation forms, consolidated into single modal interface with improved UX and form validation
- **Fixed Learning Path Navigation**: Implemented functional "Start Practice" and "Work Toward This Goal" buttons that properly navigate to Games page using wouter routing
- **Enhanced Quick Looks Functionality**: Fixed "Show Again" button to properly display visual patterns during discussion phase with disabled state management and visual feedback
- **Multi-User Profile System**: Implemented complete user switching functionality with individual data isolation for progress, avatars, rewards, and observations stored separately per user profile
- **User Management Interface**: Created UserSwitcher component with profile creation, switching, and deletion capabilities while maintaining individual customizations
- **Data Persistence Per User**: Updated all localStorage functions to scope data by user ID, ensuring each student profile maintains separate progress tracking and avatar customization
- **Teacher Admin Dashboard**: Created comprehensive admin panel with student management, progress reports, and class analytics for educators
- **Student Profile Management**: Teachers can add, edit, and delete student profiles with individual data isolation and cleanup
- **Progress Reports and Analytics**: Automated report generation with downloadable individual progress reports and class-wide analytics dashboard
- **Data Export Functionality**: Teachers can export all student data and individual progress reports following Bay-Williams framework recommendations
- **Expanded Self-Assessment System**: Added comprehensive suite of eight assessment types:
  - Addition & Subtraction Facts: Foundational Addition, Foundational Subtraction, Derived Addition, Derived Subtraction
  - Multiplication & Division Facts: Foundational Multiplication (2s, 5s, 10s, squares), Derived Multiplication (doubling, near squares, break apart), Derived Division
  - Special Categories: Combinations & Sums assessment
- **Research-Based Sorting Categories**: Each assessment uses authentic sorting strategies from pages 25, 29-30, 35-36, 40, and 44 of the Bay-Williams framework
- **Enhanced UI Design**: Horizontal drop zone layout for better visibility, expression-only math fact cards, organized assessment selection with clear groupings
- **Authentic Fact Generation**: Generated fact sets match specific examples and problem groupings from the PDF materials