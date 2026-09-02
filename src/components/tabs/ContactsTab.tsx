import { BusinessCardItem } from '../BusinessCardItem';
import React, { useState, useMemo } from 'react';
import type { BusinessCard } from '../../types';
import { Search, ArrowUpDown, Plus, Eye, Paperclip, MessageCircle } from 'lucide-react';

interface ContactsTabProps {
  cards: BusinessCard[];
  onOpenCardDetail: (card: BusinessCard) => void;
  onOpenQuickAttach: (card: BusinessCard) => void;
  onOpenScanner: () => void;
}

export const ContactsTab: React.FC<ContactsTabProps> = ({
  cards,
  onOpenCardDetail,
  onOpenQuickAttach,
  onOpenScanner
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBlock, setSelectedBlock] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'recent' | 'name' | 'company'>('recent');

  const blocks = useMemo(() => {
    const set = new Set<string>();
    cards.forEach((c) => {
      if (c.blockName) set.add(c.blockName);
    });
    return Array.from(set);
  }, [cards]);

  const filteredCards = useMemo(() => {
    return cards
      .filter((card) => {
        const query = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !query ||
          card.name.toLowerCase().includes(query) ||
          (card.company && card.company.toLowerCase().includes(query)) ||
          (card.title && card.title.toLowerCase().includes(query)) ||
          (card.email && card.email.toLowerCase().includes(query)) ||
          (card.phone && card.phone.toLowerCase().includes(query)) ||
          (card.whatsapp && card.whatsapp.toLowerCase().includes(query)) ||
          (card.wechat && card.wechat.toLowerCase().includes(query)) ||
          (card.notes && card.notes.toLowerCase().includes(query)) ||
          (card.tags && card.tags.some((t) => t.toLowerCase().includes(query))) ||
          (card.blockName && card.blockName.toLowerCase().includes(query));

        const matchesBlock = selectedBlock === 'ALL' || card.blockName === selectedBlock;

        return matchesSearch && matchesBlock;
      })
      .sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'company') return (a.company || '').localeCompare(b.company || '');
        return b.createdAt - a.createdAt;
      });
  }, [cards, searchQuery, selectedBlock, sortBy]);

  return (
    <div className="flex flex-col gap-4 pb-24 animate-in fade-in">
      <div className="flex items-center justify-between px-1">
        <div>
          <h1 className="text-xl font-bold text-slate-900">All Contacts</h1>
          <p className="text-xs text-slate-500">{cards.length} saved business cards</p>
        </div>
        <button
          onClick={onOpenScanner}
          className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-2xl shadow-xs transition-transform active:scale-95"
        >
          <Plus className="w-4 h-4" /> Scan Card
        </button>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name, company, email, WhatsApp, WeChat..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200/80 rounded-2xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
          >
            Clear
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        <button
          onClick={() => setSelectedBlock('ALL')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all ${
            selectedBlock === 'ALL'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          All ({cards.length})
        </button>

        {blocks.map((block) => (
          <button
            key={block}
            onClick={() => setSelectedBlock(block)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all ${
              selectedBlock === block
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {block}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between px-1 text-xs text-slate-500">
        <span>Showing {filteredCards.length} contacts</span>
        <div className="flex items-center gap-1">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
            className="bg-transparent text-xs text-slate-700 font-medium focus:outline-none cursor-pointer"
          >
            <option value="recent">Recently Added</option>
            <option value="name">Name (A-Z)</option>
            <option value="company">Company (A-Z)</option>
          </select>
        </div>
      </div>

      {filteredCards.length > 0 ? (
        <div className="space-y-3">
          {filteredCards.map((card) => (
            <BusinessCardItem
              key={card.id}
              card={card}
              onOpenCardDetail={onOpenCardDetail}
              onOpenQuickAttach={onOpenQuickAttach}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-100 p-8 text-center shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800 mb-1">No contacts match your filter</h3>
          <p className="text-xs text-slate-400 mb-4">Try adjusting your search query or clear the filter.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedBlock('ALL');
            }}
            className="px-4 py-2 bg-indigo-50 text-indigo-600 font-semibold text-xs rounded-xl"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};
