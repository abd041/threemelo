'use client';
import {Component, Suspense, lazy} from 'react';

const Studio = lazy(() => import('./room/Studio.jsx'));

class RoomBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {error: null};
  }
  static getDerivedStateFromError(error) {
    return {error};
  }
  render() {
    if (this.state.error) return <p className="rp-fallback" role="alert">The room planner hit an unexpected error. Saved projects remain in this browser. Reload the page to try again.</p>;
    return this.props.children;
  }
}

export default function RoomPlanner() {
  return <RoomBoundary><Suspense fallback={<div className="rp-loading-slot" role="status">Loading the room planner…</div>}><Studio/></Suspense></RoomBoundary>;
}
