import React from 'react';
import TestimonialsCarousel from './TestimonialsCarousel';
import SocialGallery from './SocialGallery';

export default function CommunitySection() {
    return (
        <div className="space-y-6 md:space-y-8 mt-8 md:mt-12 animate-fade-in relative z-20">
            <TestimonialsCarousel />
            <SocialGallery />
        </div>
    );
}
