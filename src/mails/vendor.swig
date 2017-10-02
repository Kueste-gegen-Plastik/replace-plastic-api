<i><small>English version below</small></i><br />
<h1>Sehr geehrte Damen und Herren,</h1>
{% if foundEntries.length > 1 %}
<p>wir wenden uns heute an Sie, weil Sie folgende Produkte anbieten:<p>
<ul>
{% for entry in foundEntries %}
  <li>{{ entry.productname }}</li>
{% endfor %}
</ul>
{% else %}
<p>wir wenden uns heute an Sie, weil Sie folgendes Produkt anbieten: "{{ foundEntries[0].productname }}".<p>
{% endif %}
<p><strong>{{ fullAmount }}</strong> Verbraucher haben über unsere Smartphone-App replacePlastic angegeben, dass sie sich {% if foundEntries.length > 1 %}diese Produkte{% else %}dieses Produkt{% endif %} in einer Verpackung ohne Plastik/mit weniger Plastik wünschen.</p>
<p>Plastikmüll in den Meeren stellt ein großes Problem dar, weshalb immer mehr Verbraucher ein Bewusstsein für dieses Thema zeigen. Viele Menschen wünschen sich plastikfreie Verpackungen. Aus diesem Grund senden wir Ihnen heute die Wünsche der Verbraucher zu Ihrem Produkt.</p>
<p>Wir hoffen, dass diese Information über die Wünsche und Werte Ihrer Zielgruppen für Sie hilfreich ist, um bessere Lösungen für Ihre Kunden zu verwirklichen.</p>
<p>Für mehr Informationen zu unserem Projekt besuchen Sie gern unsere Website <a href="http://www.replaceplastic.de">ReplacePlastic.de</a></p>
<p>Mit freundlichen Grüßen,<br/>das Team vom Verein Küste gegen Plastik e.V.</p>
<br /><br />
<p>
Küste gegen Plastik e.V.<br />
E-Mail: <a href="mailto:post@kueste-gegen-plastik.de">post@kueste-gegen-plastik.de</a><br />
Internet: <a href="http://kueste-gegen-plastik.de">kueste-gegen-plastik.de</a><br /><br />
Registriert im Vereinsregister beim Amtgsgericht Flensburg unter VR 2821 FL.<br />
Sitz: Reimersbude 12, 25889 Witzwort<br />
Vorstand i. S. d. § 26 BGB<br />
Jennifer Timrott, Vorsitzende<br />
Andreas Halle, stellv. Vorsitzender<br />
Dr. Thomas Daußmann, Kassenwart<br />
</p>
<br /><br />
<h1 name="english">Dear Ladies and Gentlemen,</h1>
{% if foundEntries.length > 1 %}
<p>Today we like to approach you regarding your products:<p>
<ul>
{% for entry in foundEntries %}
  <li>{{ entry.productname }}</li>
{% endfor %}
</ul>
{% else %}
<p>Today we like to approach you regarding your product: "{{ foundEntries[0].productname }}".<p>
{% endif %}
<p>By using our smartphone app replacePlastic <strong>{{ fullAmount }}</strong> consumers have indicated that they like to see your {% if foundEntries.length > 1 %}products{% else %}product{% endif %} in a different packaging displaying less or ideally no plastic at all.</p>
<p>As you have probably heard plastic waste in our ocean creates big issues which causes more and more attention at the consumer end. Many people like to see plastic-free packaging. Therefore we are passing these requests from the consumers of your product over to you.</p>
<p>We trust that this information about the ideas and values of your target customers is useful for you to develop better packaging solutions of your products in the future.</p>
<p>Please visit our web site <a href="http://www.replaceplastic.de">ReplacePlastic.de</a> for more information about our project and basic ideas!</p>
<br /><br />
<p>
With best regards,<br />
Küste gegen Plastik e.V.<br />
</p>
