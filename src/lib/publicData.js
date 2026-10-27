import { useEffect, useState } from "react";
import * as staticData from "../data";
import { isSupabaseConfigured, supabaseRestFetch } from "./supabaseRest";

export function usePublicClubData() {
  const [data, setData] = useState({
    mission: staticData.mission,
    counters: staticData.counters,
    departments: staticData.departments,
    team: staticData.team,
    events: staticData.events,
    gallery: staticData.gallery,
    settings: {
      applications_open: true,
      applications_closed_message: "Applications are currently closed. Follow our social channels to know when the next cycle opens!",
      contact_email: "hello@isitcomgoogleclub.tn",
      instagram_url: "https://www.instagram.com/isitcomgoogleclub2/",
      linkedin_url: "https://www.linkedin.com/company/isitcom-google-club/",
      facebook_url: "",
    },
    isDynamic: false,
  });

  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    let isMounted = true;

    async function fetchDynamicData() {
      try {
        const [deptRes, teamRes, eventsRes, galleryRes, statsRes, settingsRes] = await Promise.all([
          supabaseRestFetch("/departments?select=*&order=display_order.asc").catch(() => null),
          supabaseRestFetch("/team_members?select=*&order=display_order.asc").catch(() => null),
          supabaseRestFetch("/events?select=*&order=display_order.asc,created_at.desc").catch(() => null),
          supabaseRestFetch("/gallery_images?select=*&order=display_order.asc").catch(() => null),
          supabaseRestFetch("/site_stats?select=*&order=display_order.asc").catch(() => null),
          supabaseRestFetch("/site_settings?select=*&limit=1").catch(() => null),
        ]);

        if (!isMounted) return;

        setData(prev => {
          const next = { ...prev };

          // Settings & Mission
          if (settingsRes && settingsRes[0]) {
            const s = settingsRes[0];
            next.settings = { ...prev.settings, ...s };
            if (s.mission_text) next.mission = s.mission_text;
          }

          // Stats counters
          if (statsRes && statsRes.length > 0) {
            next.counters = statsRes.map(st => ({
              value: st.value,
              suffix: st.suffix || "+",
              label: st.label,
            }));
          }

          // Departments
          if (deptRes && deptRes.length > 0) {
            next.departments = deptRes.map(d => ({
              act: d.act,
              title: d.title,
              color: d.color,
              accent: d.accent,
              copy: d.copy,
              chips: Array.isArray(d.chips) ? d.chips : typeof d.chips === "string" ? JSON.parse(d.chips) : [],
              visual: d.visual || "technical",
            }));
          }

          // Team members
          if (teamRes && teamRes.length > 0) {
            next.team = teamRes.map(m => {
              // If there is an uploaded image, use it; otherwise search in static team by name or initials
              const staticMatch = staticData.team.find(
                sm => sm.name.toLowerCase() === m.name.toLowerCase()
              );
              return {
                initials: m.initials,
                name: m.name,
                role: m.role,
                color: m.color || "#4285f4",
                image: m.image_url || staticMatch?.image || null,
                department: m.department_id,
                featured: Boolean(m.featured),
                linkedin_url: m.linkedin_url || "",
                email: m.email || "",
              };
            });
          }

          // Events
          if (eventsRes && eventsRes.length > 0) {
            next.events = eventsRes.map(e => ({
              type: e.type,
              title: e.title,
              tag: e.tag,
              desc: e.desc_text,
              art: e.art || "//",
              color: e.color || "#a8c7fa",
              image: e.image_url || null,
              link: e.registration_link || null,
            }));
          }

          // Gallery
          if (galleryRes && galleryRes.length > 0) {
            next.gallery = galleryRes.map(g => {
              const staticMatch = staticData.gallery.find(
                sg => sg.label.toLowerCase() === g.label.toLowerCase()
              );
              return {
                label: g.label,
                image: g.image_url || staticMatch?.image || "/assets/card image/workshop.webp",
                alt: g.alt || g.label,
              };
            });
          }

          next.isDynamic = true;
          return next;
        });
      } catch {
        // Fallback silently to static data on error
      }
    }

    fetchDynamicData();

    return () => {
      isMounted = false;
    };
  }, []);

  return data;
}
