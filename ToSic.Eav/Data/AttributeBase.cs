namespace ToSic.Eav.Data
{
    /// <summary>
    /// Represents an AttributeHelperTools with Values of a Generic Type
    /// </summary>
    /// <typeparam name="ValueType">Type of the Value</typeparam>
    public class AttributeBase : IAttributeBase
    {
        public string Name { get; set; }
        public string Type { get; set; }
        public bool IsTitle { get; set; }

        // additional info for the persistence layer
        public int AttributeId { get; set; }

        internal AttributeBase(string name, string type, bool isTitle)
        {
            Name = name;
            Type = type;
            IsTitle = isTitle;
        }

        /// <summary>
        /// Extended constructor when also storing the persistance ID-Info
        /// </summary>
        /// <param name="name"></param>
        /// <param name="type"></param>
        /// <param name="isTitle"></param>
        /// <param name="attributeId"></param>
        public AttributeBase(string name, string type, bool isTitle, int attributeId)
			: this(name, type, isTitle)
		{
			AttributeId = attributeId;
		}

    }
}