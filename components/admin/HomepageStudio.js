'use client';

import {useMemo, useState} from 'react';
import {useRouter} from 'next/navigation';
import MediaPicker from '@/components/admin/media/MediaPicker';

const SECTION_LABELS = {
  hero: 'Hero carousel',
  about: 'About ASAS',
  clients: 'Clients',
  services: 'Services',
  stats: 'Key statistics',
  sectors: 'Sectors',
  process: 'Our process',
  portfolio: 'Portfolio',
  why: 'Why ASAS',
  testimonials: 'Testimonials',
  team: 'Leadership team',
  contact: 'Contact',
  faq: 'FAQs',
};

const TABS = [
  {id: 'layout', label: 'Page layout'},
  {id: 'hero', label: 'Hero slides'},
  {id: 'about', label: 'About block'},
  {id: 'sectors', label: 'Sector cards'},
  {id: 'faqs', label: 'FAQs'},
];

function Pair({en, ar, enValue, arValue, onEn, onAr, multiline = false, disabled}) {
  const Control = multiline ? 'textarea' : 'input';
  return (
    <div className="pcs-pair">
      <label className="pcs-field">
        <span>{en}</span>
        <Control
          rows={multiline ? 4 : undefined}
          value={enValue || ''}
          onChange={(e) => onEn(e.target.value)}
          disabled={disabled}
        />
      </label>
      <label className="pcs-field">
        <span>{ar}</span>
        <Control
          rows={multiline ? 4 : undefined}
          value={arValue || ''}
          onChange={(e) => onAr(e.target.value)}
          disabled={disabled}
          dir="rtl"
        />
      </label>
    </div>
  );
}

export default function HomepageStudio({initialValue, canWrite}) {
  const router = useRouter();
  const [doc, setDoc] = useState(initialValue || {});
  const [tab, setTab] = useState('layout');
  const [slideIndex, setSlideIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const sections = useMemo(
    () => [...(doc.sections || [])].sort((a, b) => (a.order || 0) - (b.order || 0)),
    [doc.sections],
  );
  const slides = doc.heroSlides || [];
  const slide = slides[slideIndex] || slides[0];
  const cards = doc.sectorCards || [];
  const faqs = doc.faqs || [];

  function setSections(next) {
    setDoc((current) => ({
      ...current,
      sections: next.map((item, index) => ({...item, order: (index + 1) * 10})),
    }));
    setMessage('');
  }

  function moveSection(index, dir) {
    const next = index + dir;
    if (next < 0 || next >= sections.length) return;
    const copy = [...sections];
    [copy[index], copy[next]] = [copy[next], copy[index]];
    setSections(copy);
  }

  function updateSection(index, patch) {
    const copy = [...sections];
    copy[index] = {...copy[index], ...patch};
    setSections(copy);
  }

  function updateHeroSlide(index, patch) {
    setDoc((current) => {
      const heroSlides = [...(current.heroSlides || [])];
      heroSlides[index] = {...heroSlides[index], ...patch};
      return {...current, heroSlides};
    });
    setMessage('');
  }

  function updateSectorCard(index, patch) {
    setDoc((current) => {
      const sectorCards = [...(current.sectorCards || [])];
      sectorCards[index] = {...sectorCards[index], ...patch};
      return {...current, sectorCards};
    });
    setMessage('');
  }

  function updateAbout(patch) {
    setDoc((current) => ({...current, about: {...(current.about || {}), ...patch}}));
    setMessage('');
  }

  function updateFaq(index, patch) {
    setDoc((current) => {
      const nextFaqs = [...(current.faqs || [])];
      nextFaqs[index] = {...nextFaqs[index], ...patch};
      return {...current, faqs: nextFaqs};
    });
    setMessage('');
  }

  async function onSave() {
    if (!canWrite) return;
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const res = await fetch('/api/admin/content', {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({resource: 'homepage', document: doc}),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');
      setDoc(data.document || doc);
      setMessage('Saved');
      router.refresh();
    } catch (err) {
      setError(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="pcs">
      <nav className="pcs-pages" aria-label="Homepage editors">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={tab === item.id ? 'is-active' : ''}
            onClick={() => setTab(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <section className="pcs-editor">
        <div className="pcs-body">
          {tab === 'layout' ? (
            <div className="hps-list">
              <p className="adm-section-help" style={{margin: 0}}>
                Show or hide homepage blocks, then move them up or down. Visitors see the list from top to bottom.
              </p>
              {sections.map((section, index) => (
                <div key={section.id || index} className="hps-row">
                  <div>
                    <strong>{SECTION_LABELS[section.id] || section.id}</strong>
                    <small>{section.enabled === false ? 'Hidden on the website' : 'Visible on the website'}</small>
                  </div>
                  <label className="adm-switch">
                    <input
                      type="checkbox"
                      checked={section.enabled !== false}
                      disabled={!canWrite}
                      onChange={(e) => updateSection(index, {enabled: e.target.checked})}
                    />
                    <span className="adm-switch-track" aria-hidden />
                    <span>{section.enabled !== false ? 'On' : 'Off'}</span>
                  </label>
                  <div className="hps-move">
                    <button type="button" disabled={!canWrite || index === 0} onClick={() => moveSection(index, -1)}>
                      Up
                    </button>
                    <button
                      type="button"
                      disabled={!canWrite || index === sections.length - 1}
                      onClick={() => moveSection(index, 1)}
                    >
                      Down
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {tab === 'hero' ? (
            <>
              <div className="hps-slides">
                {slides.map((item, index) => (
                  <button
                    key={item.id || index}
                    type="button"
                    className={`hps-chip${slideIndex === index ? ' is-active' : ''}`}
                    onClick={() => setSlideIndex(index)}
                  >
                    Slide {index + 1}
                  </button>
                ))}
              </div>
              {slide ? (
                <>
                  <MediaPicker
                    label="Slide image"
                    value={slide.image || ''}
                    canWrite={canWrite}
                    onChange={(url) => updateHeroSlide(slideIndex, {image: url || ''})}
                    focalValue={slide.crop || '50% 50%'}
                    onFocalChange={(crop) => updateHeroSlide(slideIndex, {crop})}
                  />
                  <Pair
                    en="Title"
                    ar="العنوان"
                    enValue={slide.title}
                    arValue={slide.titleAr}
                    onEn={(v) => updateHeroSlide(slideIndex, {title: v})}
                    onAr={(v) => updateHeroSlide(slideIndex, {titleAr: v})}
                    disabled={!canWrite}
                  />
                  <Pair
                    en="Note"
                    ar="الوصف"
                    multiline
                    enValue={slide.note}
                    arValue={slide.noteAr}
                    onEn={(v) => updateHeroSlide(slideIndex, {note: v})}
                    onAr={(v) => updateHeroSlide(slideIndex, {noteAr: v})}
                    disabled={!canWrite}
                  />
                  <Pair
                    en="Location"
                    ar="الموقع"
                    enValue={slide.location}
                    arValue={slide.locationAr}
                    onEn={(v) => updateHeroSlide(slideIndex, {location: v})}
                    onAr={(v) => updateHeroSlide(slideIndex, {locationAr: v})}
                    disabled={!canWrite}
                  />
                </>
              ) : (
                <p className="adm-section-help">No hero slides yet.</p>
              )}
            </>
          ) : null}

          {tab === 'about' ? (
            <>
              <MediaPicker
                label="About image"
                value={doc.about?.image || ''}
                canWrite={canWrite}
                onChange={(url) => updateAbout({image: url})}
                focalValue={doc.about?.crop || '50% 50%'}
                onFocalChange={(crop) => updateAbout({crop})}
              />
              <Pair
                en="Title"
                ar="العنوان"
                enValue={doc.about?.titleEn}
                arValue={doc.about?.titleAr}
                onEn={(v) => updateAbout({titleEn: v})}
                onAr={(v) => updateAbout({titleAr: v})}
                disabled={!canWrite}
              />
              <Pair
                en="Body"
                ar="النص"
                multiline
                enValue={doc.about?.bodyEn}
                arValue={doc.about?.bodyAr}
                onEn={(v) => updateAbout({bodyEn: v})}
                onAr={(v) => updateAbout({bodyAr: v})}
                disabled={!canWrite}
              />
              <Pair
                en="Note"
                ar="ملاحظة"
                multiline
                enValue={doc.about?.noteEn}
                arValue={doc.about?.noteAr}
                onEn={(v) => updateAbout({noteEn: v})}
                onAr={(v) => updateAbout({noteAr: v})}
                disabled={!canWrite}
              />
            </>
          ) : null}

          {tab === 'sectors' ? (
            <div className="hps-list">
              {cards.map((card, index) => (
                <div key={card.key || index} className="pcs-body" style={{padding: 0, borderBottom: '1px solid #eef2f7'}}>
                  <strong>{card.title || card.key || `Card ${index + 1}`}</strong>
                  <MediaPicker
                    label="Card image"
                    value={card.image || ''}
                    canWrite={canWrite}
                    onChange={(url) => updateSectorCard(index, {image: url || ''})}
                    focalValue={card.crop || '50% 50%'}
                    onFocalChange={(crop) => updateSectorCard(index, {crop})}
                  />
                  <Pair
                    en="Title"
                    ar="العنوان"
                    enValue={card.title}
                    arValue={card.titleAr}
                    onEn={(v) => updateSectorCard(index, {title: v})}
                    onAr={(v) => updateSectorCard(index, {titleAr: v})}
                    disabled={!canWrite}
                  />
                  <Pair
                    en="Copy"
                    ar="الوصف"
                    multiline
                    enValue={card.copy}
                    arValue={card.copyAr}
                    onEn={(v) => updateSectorCard(index, {copy: v})}
                    onAr={(v) => updateSectorCard(index, {copyAr: v})}
                    disabled={!canWrite}
                  />
                </div>
              ))}
            </div>
          ) : null}

          {tab === 'faqs' ? (
            <div className="hps-list">
              {faqs.map((faq, index) => (
                <div key={faq.id || index} className="pcs-body" style={{padding: 0}}>
                  <strong>Question {index + 1}</strong>
                  <Pair
                    en="Question"
                    ar="السؤال"
                    enValue={faq.questionEn}
                    arValue={faq.questionAr}
                    onEn={(v) => updateFaq(index, {questionEn: v})}
                    onAr={(v) => updateFaq(index, {questionAr: v})}
                    disabled={!canWrite}
                  />
                  <Pair
                    en="Answer"
                    ar="الإجابة"
                    multiline
                    enValue={faq.answerEn}
                    arValue={faq.answerAr}
                    onEn={(v) => updateFaq(index, {answerEn: v})}
                    onAr={(v) => updateFaq(index, {answerAr: v})}
                    disabled={!canWrite}
                  />
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <footer className="pcs-footer">
          <span>{error || message || (canWrite ? 'Changes apply to the public homepage after save.' : 'View only')}</span>
          <button type="button" onClick={onSave} disabled={!canWrite || saving}>
            {saving ? 'Saving…' : 'Save homepage'}
          </button>
        </footer>
      </section>
    </div>
  );
}
