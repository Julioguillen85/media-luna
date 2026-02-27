import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import { Sparkles, Copy, Check, Save, Loader2, Download, Facebook, Instagram, MessageCircle, RefreshCw, Wand2 } from 'lucide-react';
import { generateContent, generateDesign, createPost } from '../../services/marketingService';

/* ── FONT MAP ── */
const FONTS = {
    elegant: { heading: "'Playfair Display', Georgia, serif", body: "'Poppins', 'Segoe UI', sans-serif" },
    modern: { heading: "'Poppins', 'Segoe UI', sans-serif", body: "'Inter', 'Segoe UI', sans-serif" },
    bold: { heading: "'Montserrat', 'Arial Black', sans-serif", body: "'Poppins', 'Segoe UI', sans-serif" },
    playful: { heading: "'Caveat', 'Comic Sans MS', cursive", body: "'Poppins', 'Segoe UI', sans-serif" },
    luxury: { heading: "'Playfair Display', Georgia, serif", body: "'Lato', 'Segoe UI', sans-serif" },
    minimal: { heading: "'Inter', 'Segoe UI', sans-serif", body: "'Inter', 'Segoe UI', sans-serif" },
    retro: { heading: "'Abril Fatface', Georgia, serif", body: "'Poppins', 'Segoe UI', sans-serif" },
};

/* ── DECORATION RENDERER ── */
function Decorations({ decorations = [], accent }) {
    return (
        <>
            {decorations.includes('circles') && (
                <>
                    <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '120px', height: '120px', borderRadius: '50%', background: `${accent}12`, pointerEvents: 'none' }} />
                    <div style={{ position: 'absolute', bottom: '40px', left: '-20px', width: '80px', height: '80px', borderRadius: '50%', background: `${accent}10`, pointerEvents: 'none' }} />
                </>
            )}
            {decorations.includes('dots') && (
                <div style={{ position: 'absolute', top: '12px', right: '16px', display: 'grid', gridTemplateColumns: 'repeat(5, 6px)', gap: '6px', pointerEvents: 'none' }}>
                    {Array.from({ length: 15 }).map((_, i) => (
                        <div key={i} style={{ width: '4px', height: '4px', borderRadius: '50%', background: `${accent}30` }} />
                    ))}
                </div>
            )}
            {decorations.includes('stars') && (
                <>
                    <div style={{ position: 'absolute', top: '18px', right: '60px', fontSize: '16px', opacity: 0.2, pointerEvents: 'none' }}>✦</div>
                    <div style={{ position: 'absolute', bottom: '50px', left: '20px', fontSize: '22px', opacity: 0.15, pointerEvents: 'none' }}>✦</div>
                    <div style={{ position: 'absolute', top: '50%', right: '14px', fontSize: '12px', opacity: 0.18, pointerEvents: 'none' }}>✦</div>
                </>
            )}
            {decorations.includes('waves') && (
                <div style={{ position: 'absolute', bottom: '45px', left: 0, right: 0, height: '30px', pointerEvents: 'none', overflow: 'hidden' }}>
                    <svg viewBox="0 0 540 30" style={{ width: '100%', height: '100%' }}>
                        <path d="M0,15 Q67.5,0 135,15 T270,15 T405,15 T540,15 V30 H0 Z" fill={`${accent}08`} />
                    </svg>
                </div>
            )}
            {decorations.includes('lines') && (
                <>
                    <div style={{ position: 'absolute', top: '60px', left: '16px', width: '40px', height: '2px', background: `${accent}15`, borderRadius: '2px', pointerEvents: 'none' }} />
                    <div style={{ position: 'absolute', top: '68px', left: '16px', width: '25px', height: '2px', background: `${accent}10`, borderRadius: '2px', pointerEvents: 'none' }} />
                </>
            )}
            {decorations.includes('sparkles') && (
                <>
                    <div style={{ position: 'absolute', top: '20px', right: '40px', fontSize: '18px', opacity: 0.25, pointerEvents: 'none' }}>✨</div>
                    <div style={{ position: 'absolute', bottom: '60px', right: '24px', fontSize: '14px', opacity: 0.2, pointerEvents: 'none' }}>✨</div>
                    <div style={{ position: 'absolute', top: '45%', left: '12px', fontSize: '12px', opacity: 0.15, pointerEvents: 'none' }}>💫</div>
                </>
            )}
            {decorations.includes('confetti') && (
                <>
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} style={{
                            position: 'absolute',
                            top: `${10 + Math.random() * 80}%`,
                            left: `${5 + Math.random() * 90}%`,
                            width: `${4 + Math.random() * 6}px`,
                            height: `${4 + Math.random() * 6}px`,
                            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
                            background: `${accent}${Math.floor(15 + Math.random() * 20).toString(16)}`,
                            transform: `rotate(${Math.random() * 360}deg)`,
                            pointerEvents: 'none',
                        }} />
                    ))}
                </>
            )}
            {decorations.includes('geometric') && (
                <>
                    <div style={{ position: 'absolute', top: '15px', right: '15px', width: '60px', height: '60px', border: `2px solid ${accent}12`, transform: 'rotate(45deg)', pointerEvents: 'none' }} />
                    <div style={{ position: 'absolute', bottom: '50px', left: '10px', width: '35px', height: '35px', border: `2px solid ${accent}10`, borderRadius: '4px', transform: 'rotate(15deg)', pointerEvents: 'none' }} />
                </>
            )}
            {decorations.includes('gradient-orbs') && (
                <>
                    <div style={{ position: 'absolute', top: '10%', right: '-10%', width: '180px', height: '180px', borderRadius: '50%', background: `radial-gradient(circle, ${accent}15, transparent)`, pointerEvents: 'none', filter: 'blur(20px)' }} />
                    <div style={{ position: 'absolute', bottom: '15%', left: '-8%', width: '140px', height: '140px', borderRadius: '50%', background: `radial-gradient(circle, ${accent}10, transparent)`, pointerEvents: 'none', filter: 'blur(15px)' }} />
                </>
            )}
            {decorations.includes('floral') && (
                <>
                    <div style={{ position: 'absolute', top: '10px', right: '20px', fontSize: '20px', opacity: 0.12, pointerEvents: 'none' }}>🌸</div>
                    <div style={{ position: 'absolute', bottom: '55px', left: '15px', fontSize: '16px', opacity: 0.1, pointerEvents: 'none' }}>🌿</div>
                </>
            )}
        </>
    );
}

/* ── IMAGE STYLE HELPER ── */
function getImageContainerStyle(imageStyle, accent, cardBg, size = 110) {
    const base = { width: `${size}px`, height: `${size}px`, flexShrink: 0, overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center', background: cardBg };
    switch (imageStyle) {
        case 'circle': return { ...base, borderRadius: '50%', border: `3px solid ${accent}`, boxShadow: `0 4px 16px ${accent}25` };
        case 'rounded': return { ...base, borderRadius: '20px', border: `2px solid ${accent}20`, padding: '6px' };
        case 'square': return { ...base, borderRadius: '4px', border: `2px solid ${accent}15` };
        case 'diamond': return { ...base, borderRadius: '12px', transform: 'rotate(45deg)', border: `2px solid ${accent}20` };
        case 'blob': return { ...base, borderRadius: '60% 40% 70% 30% / 50% 60% 40% 50%', border: `2px solid ${accent}15` };
        default: return { ...base, borderRadius: '16px', border: `2px solid ${accent}20`, padding: '6px' };
    }
}

/* ── CARD STYLE HELPER ── */
function getCardCSS(cardStyle, accent, cardBg) {
    const base = { overflow: 'hidden', background: cardBg };
    switch (cardStyle) {
        case 'rounded': return { ...base, borderRadius: '20px', border: `1.5px solid ${accent}18` };
        case 'sharp': return { ...base, borderRadius: '4px', border: `2px solid ${accent}20` };
        case 'pill': return { ...base, borderRadius: '999px', border: `1.5px solid ${accent}15`, padding: '4px' };
        case 'glass': return { ...base, borderRadius: '16px', backdropFilter: 'blur(10px)', border: `1px solid ${accent}20`, boxShadow: `0 8px 32px ${accent}10` };
        case 'floating': return { ...base, borderRadius: '18px', border: 'none', boxShadow: `0 6px 20px rgba(0,0,0,0.12)` };
        case 'outlined': return { ...base, borderRadius: '14px', border: `2px solid ${accent}`, background: 'transparent' };
        default: return { ...base, borderRadius: '16px', border: `1.5px solid ${accent}15` };
    }
}

/* ── POSTER HEADER ── */
function PosterHeader({ design, fonts }) {
    const { palette: pal, title, subtitle, headerStyle = 'centered' } = design;
    const isLeft = headerStyle === 'left-aligned';
    const isMinimal = headerStyle === 'minimal';

    return (
        <div style={{ textAlign: isLeft ? 'left' : 'center', padding: isMinimal ? '16px 28px 4px' : '20px 28px 8px' }}>
            <p style={{
                fontFamily: fonts.heading, fontSize: isMinimal ? '22px' : '28px',
                fontWeight: '700', fontStyle: 'italic', color: pal.text, margin: 0, lineHeight: 1.15,
            }}>{title}</p>
            {!isMinimal && <div style={{ width: isLeft ? '40px' : '50px', height: '2px', background: pal.accent, margin: isLeft ? '8px 0' : '8px auto', borderRadius: '2px' }} />}
            {subtitle && (
                <p style={{ fontFamily: fonts.body, fontSize: '11px', fontWeight: '500', color: pal.text, opacity: 0.5, margin: '4px 0 0', letterSpacing: '2px', textTransform: 'uppercase' }}>
                    {subtitle}
                </p>
            )}
        </div>
    );
}

/* ── DYNAMIC LAYOUT RENDERERS ── */

function LayoutPackages({ products, design, fonts }) {
    const { palette: pal, imageStyle, posterText } = design;
    const dividerColor = `${pal.accent}12`;
    return (
        <>
            {products.map((p, i) => (
                <div key={i} style={{ display: 'flex', gap: '14px', padding: '10px 24px', alignItems: 'center', borderBottom: i < products.length - 1 ? `1px solid ${dividerColor}` : 'none' }}>
                    <div style={getImageContainerStyle(imageStyle, pal.accent, pal.cardBg, 100)}>
                        <img src={p.img} alt={p.name} crossOrigin="anonymous"
                            style={{ width: '100%', height: '100%', objectFit: imageStyle === 'diamond' ? 'cover' : 'contain', transform: imageStyle === 'diamond' ? 'rotate(-45deg) scale(1.3)' : 'none', borderRadius: imageStyle === 'circle' ? '50%' : '8px' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <p style={{ fontFamily: fonts.heading, fontSize: '17px', fontWeight: '700', color: pal.text, margin: '0 0 3px', lineHeight: 1.2 }}>{p.name}</p>
                        {p.description && <p style={{ fontFamily: fonts.body, fontSize: '10px', fontWeight: '400', color: pal.text, opacity: 0.55, margin: '0 0 6px', lineHeight: 1.4 }}>{p.description?.substring(0, 80)}</p>}
                        <span style={{ fontFamily: fonts.heading, fontSize: '22px', fontWeight: '900', color: pal.price, fontStyle: 'italic' }}>${p.price}</span>
                    </div>
                </div>
            ))}
            {posterText && <div style={{ padding: '10px 28px 6px', textAlign: 'center' }}><p style={{ fontFamily: fonts.body, fontSize: '11px', color: pal.text, opacity: 0.45, fontStyle: 'italic', lineHeight: 1.5, margin: 0 }}>{posterText}</p></div>}
        </>
    );
}

function LayoutGrid({ products, design, fonts }) {
    const { palette: pal, cardStyle, imageStyle, posterText } = design;
    const cols = products.length <= 2 ? products.length : products.length <= 4 ? 2 : 3;
    return (
        <>
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: '10px', padding: '4px 18px 12px' }}>
                {products.map((p, i) => (
                    <div key={i} style={{ ...getCardCSS(cardStyle, pal.accent, pal.cardBg), gridColumn: products.length === 3 && i === 0 ? 'span 2' : undefined }}>
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '8px', height: '120px' }}>
                            <img src={p.img} alt={p.name} crossOrigin="anonymous" style={{ maxWidth: '100%', maxHeight: '105px', objectFit: 'contain', borderRadius: '8px' }} />
                        </div>
                        <div style={{ padding: '0 8px 8px', textAlign: 'center' }}>
                            <p style={{ fontFamily: fonts.heading, fontSize: '13px', fontWeight: '700', color: pal.text, margin: '0 0 2px' }}>{p.name}</p>
                            <span style={{ fontFamily: fonts.heading, fontSize: '18px', fontWeight: '900', color: pal.price, fontStyle: 'italic' }}>${p.price}</span>
                        </div>
                    </div>
                ))}
            </div>
            {posterText && <div style={{ padding: '4px 28px 6px', textAlign: 'center' }}><p style={{ fontFamily: fonts.body, fontSize: '11px', color: pal.text, opacity: 0.45, fontStyle: 'italic', lineHeight: 1.5, margin: 0 }}>{posterText}</p></div>}
        </>
    );
}

function LayoutHero({ products, design, fonts }) {
    const { palette: pal, imageStyle, cardStyle, posterText } = design;
    const hero = products[0];
    const rest = products.slice(1);
    return (
        <>
            <div style={{ display: 'flex', gap: '16px', padding: '4px 24px 12px', alignItems: 'center' }}>
                <div style={getImageContainerStyle(imageStyle, pal.accent, pal.cardBg, 170)}>
                    <img src={hero.img} alt={hero.name} crossOrigin="anonymous" style={{ maxWidth: '100%', maxHeight: '155px', objectFit: 'contain', transform: imageStyle === 'diamond' ? 'rotate(-45deg) scale(1.3)' : 'none' }} />
                </div>
                <div style={{ flex: 1 }}>
                    <p style={{ fontFamily: fonts.heading, fontSize: '22px', fontWeight: '700', fontStyle: 'italic', color: pal.text, margin: 0, lineHeight: 1.15 }}>{hero.name}</p>
                    {hero.description && <p style={{ fontFamily: fonts.body, fontSize: '10px', color: pal.text, opacity: 0.55, margin: '4px 0 8px', lineHeight: 1.4 }}>{hero.description}</p>}
                    <span style={{ fontFamily: fonts.heading, fontSize: '30px', fontWeight: '900', color: pal.price, fontStyle: 'italic' }}>${hero.price}</span>
                </div>
            </div>
            {rest.length > 0 && (
                <div style={{ display: 'flex', gap: '8px', padding: '0 18px 10px', justifyContent: 'center' }}>
                    {rest.map((pr, i) => (
                        <div key={i} style={{ ...getCardCSS(cardStyle, pal.accent, pal.cardBg), flex: 1, maxWidth: '130px', textAlign: 'center' }}>
                            <div style={{ display: 'flex', justifyContent: 'center', padding: '6px', height: '70px', alignItems: 'center' }}>
                                <img src={pr.img} alt={pr.name} crossOrigin="anonymous" style={{ maxWidth: '100%', maxHeight: '62px', objectFit: 'contain' }} />
                            </div>
                            <div style={{ padding: '0 6px 6px' }}>
                                <p style={{ fontFamily: fonts.body, fontSize: '9px', fontWeight: '600', color: pal.text, margin: 0 }}>{pr.name}</p>
                                <span style={{ fontFamily: fonts.heading, fontSize: '14px', fontWeight: '900', color: pal.price, fontStyle: 'italic' }}>${pr.price}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            {posterText && <div style={{ padding: '4px 28px 6px', textAlign: 'center' }}><p style={{ fontFamily: fonts.body, fontSize: '11px', color: pal.text, opacity: 0.45, fontStyle: 'italic', lineHeight: 1.5, margin: 0 }}>{posterText}</p></div>}
        </>
    );
}

function LayoutSplit({ products, design, fonts }) {
    const { palette: pal, imageStyle, posterText } = design;
    return (
        <>
            {products.map((p, i) => (
                <div key={i} style={{ display: 'flex', gap: '12px', padding: '8px 24px', flexDirection: i % 2 === 0 ? 'row' : 'row-reverse', alignItems: 'center' }}>
                    <div style={getImageContainerStyle(imageStyle, pal.accent, pal.cardBg, 110)}>
                        <img src={p.img} alt={p.name} crossOrigin="anonymous" style={{ maxWidth: '100%', maxHeight: '95px', objectFit: 'contain', transform: imageStyle === 'diamond' ? 'rotate(-45deg) scale(1.3)' : 'none' }} />
                    </div>
                    <div style={{ flex: 1, textAlign: i % 2 === 0 ? 'left' : 'right' }}>
                        <p style={{ fontFamily: fonts.heading, fontSize: '15px', fontWeight: '700', color: pal.text, margin: '0 0 2px' }}>{p.name}</p>
                        {p.description && <p style={{ fontFamily: fonts.body, fontSize: '9px', color: pal.text, opacity: 0.5, margin: '0 0 4px', lineHeight: 1.3 }}>{p.description?.substring(0, 60)}</p>}
                        <span style={{ fontFamily: fonts.heading, fontSize: '20px', fontWeight: '900', color: pal.price, fontStyle: 'italic' }}>${p.price}</span>
                    </div>
                </div>
            ))}
            {posterText && <div style={{ padding: '10px 28px 6px', textAlign: 'center' }}><p style={{ fontFamily: fonts.body, fontSize: '11px', color: pal.text, opacity: 0.45, fontStyle: 'italic', lineHeight: 1.5, margin: 0 }}>{posterText}</p></div>}
        </>
    );
}

function LayoutCarousel({ products, design, fonts }) {
    const { palette: pal, cardStyle, imageStyle, posterText } = design;
    return (
        <>
            <div style={{ display: 'flex', gap: '12px', padding: '6px 20px 12px', overflowX: 'hidden' }}>
                {products.map((p, i) => (
                    <div key={i} style={{ ...getCardCSS(cardStyle, pal.accent, pal.cardBg), minWidth: products.length <= 3 ? '150px' : '130px', flex: '0 0 auto', textAlign: 'center' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '10px', height: '130px' }}>
                            <img src={p.img} alt={p.name} crossOrigin="anonymous" style={{ maxWidth: '100%', maxHeight: '115px', objectFit: 'contain', borderRadius: '8px' }} />
                        </div>
                        <div style={{ padding: '0 8px 10px' }}>
                            <p style={{ fontFamily: fonts.heading, fontSize: '12px', fontWeight: '700', color: pal.text, margin: '0 0 2px' }}>{p.name}</p>
                            <span style={{ fontFamily: fonts.heading, fontSize: '18px', fontWeight: '900', color: pal.price, fontStyle: 'italic' }}>${p.price}</span>
                        </div>
                    </div>
                ))}
            </div>
            {posterText && <div style={{ padding: '4px 28px 6px', textAlign: 'center' }}><p style={{ fontFamily: fonts.body, fontSize: '11px', color: pal.text, opacity: 0.45, fontStyle: 'italic', lineHeight: 1.5, margin: 0 }}>{posterText}</p></div>}
        </>
    );
}

function LayoutMagazine({ products, design, fonts }) {
    const { palette: pal, imageStyle, posterText } = design;
    const main = products[0];
    const sidebar = products.slice(1);
    return (
        <>
            <div style={{ display: 'flex', gap: '14px', padding: '6px 22px 12px' }}>
                <div style={{ flex: 2 }}>
                    <div style={{ ...getImageContainerStyle(imageStyle, pal.accent, pal.cardBg, 200), width: '100%', height: '200px' }}>
                        <img src={main.img} alt={main.name} crossOrigin="anonymous" style={{ maxWidth: '100%', maxHeight: '190px', objectFit: 'contain', transform: imageStyle === 'diamond' ? 'rotate(-45deg) scale(1.3)' : 'none' }} />
                    </div>
                    <p style={{ fontFamily: fonts.heading, fontSize: '18px', fontWeight: '700', color: pal.text, margin: '8px 0 2px', textAlign: 'center' }}>{main.name}</p>
                    <p style={{ fontFamily: fonts.heading, fontSize: '26px', fontWeight: '900', color: pal.price, fontStyle: 'italic', textAlign: 'center', margin: 0 }}>${main.price}</p>
                </div>
                {sidebar.length > 0 && (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', justifyContent: 'center' }}>
                        {sidebar.map((p, i) => (
                            <div key={i} style={{ textAlign: 'center', padding: '8px', background: pal.cardBg, borderRadius: '12px', border: `1px solid ${pal.accent}12` }}>
                                <img src={p.img} alt={p.name} crossOrigin="anonymous" style={{ maxWidth: '80%', maxHeight: '55px', objectFit: 'contain', margin: '0 auto 4px' }} />
                                <p style={{ fontFamily: fonts.body, fontSize: '9px', fontWeight: '600', color: pal.text, margin: 0 }}>{p.name}</p>
                                <span style={{ fontFamily: fonts.heading, fontSize: '13px', fontWeight: '900', color: pal.price, fontStyle: 'italic' }}>${p.price}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            {posterText && <div style={{ padding: '4px 28px 6px', textAlign: 'center' }}><p style={{ fontFamily: fonts.body, fontSize: '11px', color: pal.text, opacity: 0.45, fontStyle: 'italic', lineHeight: 1.5, margin: 0 }}>{posterText}</p></div>}
        </>
    );
}

function LayoutDiagonal({ products, design, fonts }) {
    const { palette: pal, imageStyle, posterText } = design;
    return (
        <>
            {products.map((p, i) => (
                <div key={i} style={{ display: 'flex', gap: '12px', padding: '6px 24px', alignItems: 'center', marginLeft: `${i * 16}px` }}>
                    <div style={getImageContainerStyle(imageStyle, pal.accent, pal.cardBg, 90)}>
                        <img src={p.img} alt={p.name} crossOrigin="anonymous" style={{ maxWidth: '100%', maxHeight: '80px', objectFit: 'contain', transform: imageStyle === 'diamond' ? 'rotate(-45deg) scale(1.3)' : 'none' }} />
                    </div>
                    <div>
                        <p style={{ fontFamily: fonts.heading, fontSize: '14px', fontWeight: '700', color: pal.text, margin: 0 }}>{p.name}</p>
                        <span style={{ fontFamily: fonts.heading, fontSize: '20px', fontWeight: '900', color: pal.price, fontStyle: 'italic' }}>${p.price}</span>
                    </div>
                </div>
            ))}
            {posterText && <div style={{ padding: '10px 28px 6px', textAlign: 'center' }}><p style={{ fontFamily: fonts.body, fontSize: '11px', color: pal.text, opacity: 0.45, fontStyle: 'italic', lineHeight: 1.5, margin: 0 }}>{posterText}</p></div>}
        </>
    );
}

function LayoutMosaic({ products, design, fonts }) {
    const { palette: pal, cardStyle, posterText } = design;
    const areas = products.length <= 3
        ? `"a a b" "a a c"`
        : products.length <= 5
            ? `"a a b" "a a c" "d d e"`
            : `"a a b" "a a c" "d e f"`;
    return (
        <>
            <div style={{ display: 'grid', gridTemplateAreas: areas, gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', padding: '6px 18px 12px' }}>
                {products.slice(0, 6).map((p, i) => (
                    <div key={i} style={{ ...getCardCSS(cardStyle, pal.accent, pal.cardBg), gridArea: String.fromCharCode(97 + i), display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '8px' }}>
                        <img src={p.img} alt={p.name} crossOrigin="anonymous" style={{ maxWidth: '90%', maxHeight: i === 0 ? '130px' : '65px', objectFit: 'contain', marginBottom: '4px' }} />
                        <p style={{ fontFamily: fonts.heading, fontSize: i === 0 ? '14px' : '10px', fontWeight: '700', color: pal.text, margin: 0, textAlign: 'center' }}>{p.name}</p>
                        <span style={{ fontFamily: fonts.heading, fontSize: i === 0 ? '20px' : '14px', fontWeight: '900', color: pal.price, fontStyle: 'italic' }}>${p.price}</span>
                    </div>
                ))}
            </div>
            {posterText && <div style={{ padding: '4px 28px 6px', textAlign: 'center' }}><p style={{ fontFamily: fonts.body, fontSize: '11px', color: pal.text, opacity: 0.45, fontStyle: 'italic', lineHeight: 1.5, margin: 0 }}>{posterText}</p></div>}
        </>
    );
}

function LayoutBanner({ products, design, fonts }) {
    const { palette: pal, imageStyle, posterText } = design;
    return (
        <>
            <div style={{ display: 'flex', gap: '6px', padding: '4px 20px 8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                {products.map((p, i) => (
                    <div key={i} style={getImageContainerStyle(imageStyle, pal.accent, pal.cardBg, 75)}>
                        <img src={p.img} alt={p.name} crossOrigin="anonymous" style={{ maxWidth: '100%', maxHeight: '65px', objectFit: 'contain', transform: imageStyle === 'diamond' ? 'rotate(-45deg) scale(1.3)' : 'none' }} />
                    </div>
                ))}
            </div>
            <div style={{ padding: '6px 22px 8px' }}>
                {products.map((p, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: i < products.length - 1 ? `1px solid ${pal.accent}10` : 'none' }}>
                        <p style={{ fontFamily: fonts.heading, fontSize: '13px', fontWeight: '700', color: pal.text, margin: 0 }}>{p.name}</p>
                        <span style={{ fontFamily: fonts.heading, fontSize: '18px', fontWeight: '900', color: pal.price, fontStyle: 'italic' }}>${p.price}</span>
                    </div>
                ))}
            </div>
            {posterText && <div style={{ padding: '6px 28px 6px', textAlign: 'center' }}><p style={{ fontFamily: fonts.body, fontSize: '11px', color: pal.text, opacity: 0.45, fontStyle: 'italic', lineHeight: 1.5, margin: 0 }}>{posterText}</p></div>}
        </>
    );
}

function LayoutMinimal({ products, design, fonts }) {
    const { palette: pal, posterText } = design;
    return (
        <>
            <div style={{ padding: '4px 28px 12px' }}>
                {products.map((p, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: `1px solid ${pal.accent}08` }}>
                        <div>
                            <p style={{ fontFamily: fonts.heading, fontSize: '16px', fontWeight: '700', color: pal.text, margin: 0 }}>{p.name}</p>
                            {p.description && <p style={{ fontFamily: fonts.body, fontSize: '9px', color: pal.text, opacity: 0.4, margin: '2px 0 0' }}>{p.description?.substring(0, 50)}</p>}
                        </div>
                        <span style={{ fontFamily: fonts.heading, fontSize: '22px', fontWeight: '900', color: pal.price, fontStyle: 'italic' }}>${p.price}</span>
                    </div>
                ))}
            </div>
            {posterText && <div style={{ padding: '4px 28px 6px', textAlign: 'center' }}><p style={{ fontFamily: fonts.body, fontSize: '11px', color: pal.text, opacity: 0.45, fontStyle: 'italic', lineHeight: 1.5, margin: 0 }}>{posterText}</p></div>}
        </>
    );
}

/* ── LAYOUT MAP ── */
const LAYOUT_MAP = {
    packages: LayoutPackages,
    grid: LayoutGrid,
    hero: LayoutHero,
    split: LayoutSplit,
    carousel: LayoutCarousel,
    magazine: LayoutMagazine,
    diagonal: LayoutDiagonal,
    mosaic: LayoutMosaic,
    banner: LayoutBanner,
    minimal: LayoutMinimal,
};

/* ── FALLBACK DESIGN ── */
const FALLBACK_DESIGN = {
    layout: 'grid',
    palette: { bgFrom: '#ffecd2', bgTo: '#fcb69f', accent: '#e8507e', text: '#3d1a2e', price: '#c0392b', cardBg: 'rgba(255,255,255,0.7)' },
    title: '¡No te quedes con el antojo!',
    subtitle: 'Fruti Bar & Snacks',
    posterText: 'Pide por WhatsApp 🌙',
    decorations: ['circles'],
    typography: 'elegant',
    cardStyle: 'rounded',
    imageStyle: 'circle',
    headerStyle: 'centered',
};

/* ══════════════════════════════════════════════ */
/*             MAIN COMPONENT                   */
/* ══════════════════════════════════════════════ */

export default function ContentGenerator({ products }) {
    const [tone, setTone] = useState('divertido');
    const [occasion, setOccasion] = useState('');
    const [platform, setPlatform] = useState('FACEBOOK_PAGE');
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [generatedContent, setGeneratedContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [designLoading, setDesignLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [saved, setSaved] = useState(false);
    const [posterReady, setPosterReady] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [design, setDesign] = useState(null);
    const posterRef = useRef(null);

    const tones = [
        { id: 'divertido', label: '😄 Divertido' },
        { id: 'profesional', label: '💼 Profesional' },
        { id: 'urgente', label: '🔥 Urgente' },
        { id: 'amigable', label: '🤗 Amigable' },
        { id: 'creativo', label: '🎨 Creativo' },
        { id: 'elegante', label: '✨ Elegante' },
        { id: 'navideño', label: '🎄 Navideño' },
        { id: 'retro', label: '🕹️ Retro' },
    ];

    const getProducts = () => {
        if (!products) return [];
        const pool = selectedProducts.length > 0
            ? products.filter(p => selectedProducts.includes(p.name) && p.img)
            : products.filter(p => p.img).slice(0, 4);
        return pool;
    };

    const parseDesignJSON = (raw) => {
        try {
            let cleaned = raw.trim();
            // Remove markdown code fences if present
            if (cleaned.startsWith('```')) {
                cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '');
            }
            const parsed = JSON.parse(cleaned);
            // Validate required fields
            if (!parsed.palette || !parsed.layout) throw new Error('Missing fields');
            return { ...FALLBACK_DESIGN, ...parsed };
        } catch {
            return FALLBACK_DESIGN;
        }
    };

    const handleGenerate = async () => {
        try {
            setLoading(true);
            setDesignLoading(true);
            setGeneratedContent('');
            setDesign(null);
            setPosterReady(false);

            const posterProducts = getProducts();

            // Call both APIs in parallel
            const [contentData, designData] = await Promise.all([
                generateContent({
                    tone,
                    occasion: occasion || 'publicación del día',
                    platform,
                    products: selectedProducts.length > 0 ? selectedProducts : null
                }),
                generateDesign({
                    tone,
                    occasion: occasion || 'publicación del día',
                    platform,
                    products: selectedProducts.length > 0 ? selectedProducts : null,
                    productCount: posterProducts.length || 4
                })
            ]);

            setGeneratedContent(contentData.content);
            const parsed = parseDesignJSON(designData.design);
            setDesign(parsed);
            setPosterReady(true);
        } catch (err) {
            alert('Error generando: ' + err.message);
        } finally {
            setLoading(false);
            setDesignLoading(false);
        }
    };

    const handleRedesign = async () => {
        try {
            setDesignLoading(true);
            const posterProducts = getProducts();
            const designData = await generateDesign({
                tone,
                occasion: occasion || 'publicación del día',
                platform,
                products: selectedProducts.length > 0 ? selectedProducts : null,
                productCount: posterProducts.length || 4
            });
            const parsed = parseDesignJSON(designData.design);
            setDesign(parsed);
        } catch (err) {
            alert('Error regenerando diseño: ' + err.message);
        } finally {
            setDesignLoading(false);
        }
    };

    const handleDownload = async () => {
        if (!posterRef.current) return;
        try {
            setDownloading(true);
            const canvas = await html2canvas(posterRef.current, { scale: 2, useCORS: true, backgroundColor: null });
            const link = document.createElement('a');
            link.download = `medialuna-promo-${Date.now()}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (err) {
            alert('Error descargando: ' + err.message);
        } finally {
            setDownloading(false);
        }
    };

    const handleCopy = () => { navigator.clipboard.writeText(generatedContent); setCopied(true); setTimeout(() => setCopied(false), 2000); };
    const handleSaveAsDraft = async () => {
        try { await createPost({ content: generatedContent, platform: platform === 'GROUP' ? 'FACEBOOK_PAGE' : platform, postType: 'POST', status: 'DRAFT' }); setSaved(true); setTimeout(() => setSaved(false), 2000); }
        catch (err) { alert('Error guardando: ' + err.message); }
    };
    const handleShareWhatsApp = () => window.open(`https://wa.me/?text=${encodeURIComponent(generatedContent)}`, '_blank');
    const handleShareFacebook = () => { navigator.clipboard.writeText(generatedContent); alert('✅ Texto copiado. Descarga la imagen y publícala en Facebook.'); };
    const handleShareInstagram = () => { navigator.clipboard.writeText(generatedContent); alert('✅ Texto copiado. Descarga la imagen y súbela a Instagram.'); };

    const toggleProduct = (name) => {
        setSelectedProducts(prev => prev.includes(name) ? prev.filter(p => p !== name) : [...prev, name]);
    };

    const posterProducts = getProducts();
    const d = design || FALLBACK_DESIGN;
    const fonts = FONTS[d.typography] || FONTS.elegant;
    const LayoutComp = LAYOUT_MAP[d.layout] || LayoutGrid;

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">✨ Generador de Publicidad con Lunita IA</h3>

            {/* Step 1: Products — no limit */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700/50">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">1️⃣ Elige productos para el póster</label>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 max-h-56 overflow-y-auto pr-1">
                    {products?.filter(p => p.img).map(p => {
                        const sel = selectedProducts.includes(p.name);
                        return (
                            <button key={p.id || p.name} onClick={() => toggleProduct(p.name)}
                                className={`relative rounded-xl overflow-hidden border-2 transition-all ${sel ? 'border-rose-500 shadow-lg shadow-rose-500/30 scale-[1.03]' : 'border-slate-200 dark:border-slate-700 hover:border-rose-300'}`}>
                                <img src={p.img} alt={p.name} className="w-full h-20 object-cover" />
                                <div className={`px-1 py-1 text-[10px] font-bold truncate text-center ${sel ? 'bg-rose-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>{p.name}</div>
                                {sel && <div className="absolute top-1 right-1 w-5 h-5 bg-rose-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold">✓</div>}
                            </button>
                        );
                    })}
                </div>
                <p className="text-xs text-slate-400 mt-2">{selectedProducts.length} seleccionados {selectedProducts.length === 0 && '— se usarán los primeros 4'}</p>
            </div>

            {/* Step 2: Tone & occasion */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700/50">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">2️⃣ Tono y Ocasión</label>
                <div className="flex flex-wrap gap-2 mb-3">
                    {tones.map(t => (
                        <button key={t.id} onClick={() => setTone(t.id)}
                            className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${tone === t.id ? 'bg-purple-500 text-white shadow-md' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                            {t.label}
                        </button>
                    ))}
                </div>
                <input type="text" value={occasion} onChange={e => setOccasion(e.target.value)}
                    placeholder="Título/Ocasión: Promo 2x1, Navidad, Nuevo sabor..."
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-200" />
            </div>

            {/* Generate Button */}
            <button onClick={handleGenerate} disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-purple-600 via-pink-500 to-cyan-500 text-white rounded-2xl font-bold text-base shadow-lg hover:shadow-xl disabled:opacity-60 transition-all flex items-center justify-center gap-3">
                {loading
                    ? <><Loader2 size={22} className="animate-spin" /> Lunita IA está diseñando tu publicidad...</>
                    : <><Sparkles size={22} /> Generar Publicidad con Lunita IA 🌙</>
                }
            </button>

            {/* === POSTER === */}
            {posterReady && posterProducts.length > 0 && design && (
                <>
                    <div className="flex items-center justify-center gap-3 flex-wrap">
                        <p className="text-sm font-bold text-slate-500 dark:text-slate-400">👇 Tu póster diseñado por IA</p>
                        <button onClick={handleRedesign} disabled={designLoading}
                            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-50">
                            {designLoading ? <Loader2 size={13} className="animate-spin" /> : <Wand2 size={13} />}
                            {designLoading ? 'Diseñando...' : '🎨 Generar Otro Diseño'}
                        </button>
                        <button onClick={handleRedesign} disabled={designLoading}
                            className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg text-xs font-bold">
                            <RefreshCw size={12} /> Otro más
                        </button>
                    </div>

                    {/* Design info badge */}
                    <div className="flex justify-center gap-2 flex-wrap">
                        <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full text-[10px] font-bold">
                            Layout: {d.layout}
                        </span>
                        <span className="px-2 py-1 bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 rounded-full text-[10px] font-bold">
                            Typo: {d.typography}
                        </span>
                        <span className="px-2 py-1 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 rounded-full text-[10px] font-bold">
                            Cards: {d.cardStyle}
                        </span>
                        <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-full text-[10px] font-bold">
                            Img: {d.imageStyle}
                        </span>
                    </div>

                    <div className="flex justify-center">
                        <div ref={posterRef} style={{
                            width: '540px',
                            background: `linear-gradient(160deg, ${d.palette.bgFrom} 0%, ${d.palette.bgTo} 100%)`,
                            overflow: 'hidden',
                            position: 'relative',
                        }}>
                            {/* Decorations layer */}
                            <Decorations decorations={d.decorations} accent={d.palette.accent} />

                            {/* Logo header */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '16px 24px 4px', position: 'relative', zIndex: 1 }}>
                                <img src="/pwa-512x512.png" alt="Logo" crossOrigin="anonymous"
                                    style={{ width: '38px', height: '38px', borderRadius: '50%', border: `2px solid ${d.palette.accent}` }} />
                                <div>
                                    <p style={{ fontFamily: fonts.heading, fontSize: '18px', fontWeight: '700', color: d.palette.accent, margin: 0, fontStyle: 'italic' }}>Media Luna</p>
                                    <p style={{ fontFamily: fonts.body, fontSize: '8px', fontWeight: '500', color: d.palette.text, opacity: 0.4, letterSpacing: '2px', margin: 0, textTransform: 'uppercase' }}>No te quedes con el antojo</p>
                                </div>
                            </div>

                            {/* Dynamic Header */}
                            <div style={{ position: 'relative', zIndex: 1 }}>
                                <PosterHeader design={d} fonts={fonts} />
                            </div>

                            {/* Dynamic Layout */}
                            <div style={{ position: 'relative', zIndex: 1 }}>
                                <LayoutComp products={posterProducts} design={d} fonts={fonts} />
                            </div>

                            {/* Footer */}
                            <div style={{
                                background: d.palette.accent, padding: '10px 24px', textAlign: 'center',
                                position: 'relative', zIndex: 1,
                            }}>
                                <p style={{ fontFamily: fonts.body, color: '#fff', fontSize: '11px', fontWeight: '600', margin: 0, letterSpacing: '0.5px' }}>
                                    📱 Pedidos por WhatsApp · Media Luna 🌙
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="max-w-xl mx-auto space-y-3">
                        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-100 dark:border-slate-700/50">
                            <p className="text-xs font-bold text-slate-500 mb-2">📝 Texto generado por Lunita IA:</p>
                            <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">{generatedContent}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <button onClick={handleDownload} disabled={downloading}
                                className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-bold text-sm shadow-md">
                                {downloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                                {downloading ? 'Exportando...' : 'Descargar Póster'}
                            </button>
                            <button onClick={handleCopy}
                                className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-sm">
                                {copied ? <><Check size={16} className="text-green-500" /> ¡Copiado!</> : <><Copy size={16} /> Copiar Texto</>}
                            </button>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            <button onClick={handleShareWhatsApp} className="flex items-center justify-center gap-2 px-3 py-2.5 bg-green-500 text-white rounded-xl font-bold text-xs"><MessageCircle size={14} /> WhatsApp</button>
                            <button onClick={handleShareFacebook} className="flex items-center justify-center gap-2 px-3 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-xs"><Facebook size={14} /> Facebook</button>
                            <button onClick={handleShareInstagram} className="flex items-center justify-center gap-2 px-3 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold text-xs"><Instagram size={14} /> Instagram</button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <button onClick={handleSaveAsDraft} className="flex items-center justify-center gap-2 px-3 py-2 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-xl font-bold text-xs">
                                {saved ? <><Check size={14} /> ¡Guardado!</> : <><Save size={14} /> Guardar Borrador</>}
                            </button>
                            <button onClick={handleGenerate} disabled={loading} className="flex items-center justify-center gap-2 px-3 py-2 bg-purple-50 dark:bg-purple-900/20 text-purple-600 rounded-xl font-bold text-xs">🔄 Regenerar Todo</button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
