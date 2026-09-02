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
            <div
              key={card.id}
              className="p-4 bg-white rounded-2xl border border-slate-100 shadow-xs hover:border-indigo-200 transition-all flex flex-col gap-2.5"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                {card.frontImageUrl ? (
                  <div
                    className="w-13 h-13 rounded-2xl overflow-hidden border border-slate-200 shrink-0 bg-slate-100 cursor-pointer"
                    onClick={() => onOpenCardDetail(card)}
                  >
                    <img src={card.frontImageUrl} alt={card.name} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div
                    className="w-13 h-13 rounded-2xl bg-indigo-50 text-indigo-600 font-bold text-base flex items-center justify-center shrink-0 border border-indigo-100 cursor-pointer"
                    onClick={() => onOpenCardDetail(card)}
                  >
                    {card.name.charAt(0).toUpperCase()}
                  </div>
                )}

                <div className="min-w-0 flex-1 cursor-pointer" onClick={() => onOpenCardDetail(card)}>
                  <h3 className="text-sm font-bold text-slate-900 truncate hover:text-indigo-600 transition-colors">
                    {card.name}
                  </h3>
                  <p className="text-xs text-slate-500 truncate">
                    {card.title ? `${card.title} ` : ''}
                    {card.company ? `• ${card.company}` : ''}
                  </p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-[10px] font-medium px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md">
                      {card.blockName}
                    </span>
                    {card.whatsapp && (
                      <span className="text-[10px] font-medium px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded-md flex items-center gap-0.5">
                        <MessageCircle className="w-2.5 h-2.5" /> WhatsApp
                      </span>
                    )}
                    {card.wechat && (
                      <span className="text-[10px] font-medium px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded-md">
                        WeChat
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Explicit View & Attach Media Buttons */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => onOpenCardDetail(card)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl transition-all active:scale-95"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View</span>
                </button>

                <button
                  onClick={() => onOpenQuickAttach(card)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all active:scale-95"
                >
                  <Paperclip className="w-3.5 h-3.5 text-slate-500" />
                  <span>Attach Media</span>
                </button>
              </div>
            </div>
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
